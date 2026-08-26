import { PrismaClient } from '../src/generated/prisma/client/client';
import {
  Role,
  SubmissionStatus,
  ContentType,
  LessonKind,
  SubmissionType,
  ResourceType,
  AssignmentStatus,
} from '../src/generated/prisma/client/enums';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from 'better-auth/crypto';

import { ALL_ACCESS_PRICE_IDR } from '../src/lib/pricing';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Every seed user logs in with this password. Real users never get one
// assigned this way - Students self-register via /signup, and this only
// exists to make local testing possible.
const DEFAULT_PASSWORD = 'Password123!';

// Matches better-auth's local-account issuer format for the "credential" (email/password)
// provider - see createLocalAccountIssuer() in @better-auth/core/db/schema/account.ts.
const CREDENTIAL_ISSUER = 'local:credential';

/**
 * Creates a User plus the credential Account better-auth actually authenticates
 * against (Account.password, not User.passwordHash - the latter is unused by
 * better-auth and left null here).
 */
async function createUserWithPassword(data: { name: string; email: string; role: Role }) {
  const user = await prisma.user.create({ data: { ...data, emailVerified: true } });
  await prisma.account.create({
    data: {
      userId: user.id,
      providerId: 'credential',
      issuer: CREDENTIAL_ISSUER,
      accountId: user.id,
      password: await hashPassword(DEFAULT_PASSWORD),
    },
  });
  return user;
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data in correct order
  await prisma.sessionProgress.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.moduleSession.deleteMany();
  await prisma.module.deleteMany();
  await prisma.cohortMember.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.cohort.deleteMany();
  await prisma.resourceItem.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 1. Editors (content authors / cohort owners)
  const editor = await createUserWithPassword({
    name: 'Charlie Editor',
    email: 'charlie@kelas.ai',
    role: Role.Editor,
  });

  // 2. Students
  const alice = await createUserWithPassword({
    name: 'Alice Student',
    email: 'alice@kelas.ai',
    role: Role.Student,
  });
  const bob = await createUserWithPassword({
    name: 'Bob Student',
    email: 'bob@kelas.ai',
    role: Role.Student,
  });

  // 3. Cohorts - free onsite-session/community groupings, unrelated to
  // module access (that's governed by the All-Access Payment below).
  const fundamentalsCohort = await prisma.cohort.create({
    data: {
      name: 'AI Fundamentals: Q1 Onsite',
      editorId: editor.id,
      onsiteDate: new Date('2026-10-01'),
    },
  });
  const bootcampCohort = await prisma.cohort.create({
    data: {
      name: 'Advanced Prompting Bootcamp',
      editorId: editor.id,
      onsiteDate: new Date('2026-11-15'),
    },
  });

  // Alice has bought All-Access; Bob has only joined a cohort's roster
  // without paying - this gives the grading queue and progress views
  // realistic, non-uniform data (Bob is locked out of module content).
  await prisma.payment.create({
    data: {
      studentId: alice.id,
      amount: ALL_ACCESS_PRICE_IDR,
      status: 'Paid',
      xenditInvoiceId: 'seed-invoice-1',
    },
  });
  await prisma.cohortMember.create({ data: { cohortId: fundamentalsCohort.id, userId: alice.id } });
  await prisma.cohortMember.create({ data: { cohortId: bootcampCohort.id, userId: alice.id } });
  // Bob has no All-Access, so - like any Student without it - he can't join a cohort either.

  // 4. Modul 1: Fondasi & Keamanan AI - one ~90 minute session, four content
  // blocks (Bagian A-D), plus the two required end products (data-safety
  // checklist and one practice project).
  const module1 = await prisma.module.create({
    data: {
      title: 'Modul 1: Fondasi & Keamanan AI',
      description:
        'Cara kerja AI secara awam, aturan keamanan data, dan setup tool AI yang terhubung ke Google Workspace & MS Office.',
      createdByEditorId: editor.id,
      sessions: {
        create: [
          {
            title: 'Sesi 1: Fondasi & Keamanan AI',
            order: 1,
            lessons: {
              create: [
                {
                  order: 1,
                  kind: LessonKind.Objectives,
                  contentType: ContentType.Text,
                  title: 'Tujuan Belajar Sesi Ini',
                  content:
                    'Setelah menyelesaikan sesi ini, Anda akan mampu:\n' +
                    '1. Menjelaskan secara sederhana bagaimana AI (seperti ChatGPT, Gemini, Copilot) menyusun jawabannya, dan kenapa jawabannya bisa salah.\n' +
                    '2. Menentukan data pekerjaan apa saja yang aman dan yang TIDAK boleh dimasukkan ke AI publik.\n' +
                    '3. Login dan menghubungkan akun AI resmi kantor (Gemini/Copilot) ke Google Drive/OneDrive Anda.\n' +
                    '4. Menghasilkan satu produk kerja nyata menggunakan AI dari salah satu dari 4 pilihan project praktik.',
                },
                {
                  order: 2,
                  kind: LessonKind.Summary,
                  contentType: ContentType.Text,
                  title: 'Bagian A — Bagaimana AI Sebenarnya Bekerja',
                  content:
                    'AI seperti ChatGPT, Gemini, atau Copilot bukan mesin pencari yang mengambil fakta dari database, dan bukan juga "robot pintar" yang benar-benar mengerti isi pekerjaan Anda.\n\n' +
                    'Cara kerjanya lebih sederhana dari itu: AI menyusun jawaban dengan menebak kata demi kata yang paling mungkin muncul selanjutnya, berdasarkan pola dari jutaan teks yang pernah dipelajarinya. Karena itu AI disebut Large Language Model (LLM) - model bahasa besar.\n\n' +
                    'Konsekuensinya penting untuk pekerjaan Anda:\n' +
                    '• AI bisa terdengar sangat percaya diri padahal jawabannya salah. Ini disebut "halusinasi".\n' +
                    '• AI paling sering salah untuk: angka spesifik (nomor pelanggan, nominal tagihan), aturan/SOP terbaru yang mungkin berubah setelah AI "belajar", dan data internal perusahaan yang memang tidak pernah diketahui AI.\n' +
                    '• AI TIDAK tahu apa yang sedang terjadi di kantor Anda hari ini, kecuali Anda yang memberitahunya lewat prompt.\n\n' +
                    'Aturan praktis: perlakukan jawaban AI seperti draft dari rekan kerja baru yang pintar tapi belum berpengalaman - berguna sebagai titik awal, tapi selalu dicek ulang sebelum dipakai, terutama untuk angka dan data teknis.',
                },
                {
                  order: 3,
                  kind: LessonKind.Summary,
                  contentType: ContentType.Text,
                  title: 'Bagian B — Keamanan Data: Apa yang Boleh dan Tidak Boleh',
                  content:
                    'Aturan dasar: data pelanggan dan data internal yang sensitif TIDAK BOLEH dimasukkan ke prompt AI publik versi gratis (ChatGPT, Gemini, Claude versi pribadi/gratis, dan sejenisnya).\n\n' +
                    'Yang termasuk data sensitif:\n' +
                    '• Nomor pelanggan, ID pelanggan, nomor meter\n' +
                    '• Alamat lengkap dan data kontak pelanggan\n' +
                    '• Data teknis jaringan yang bersifat rahasia (lokasi gardu, kapasitas jaringan, titik rawan gangguan)\n' +
                    '• Data internal yang belum untuk publik (rencana kerja, evaluasi kinerja, data keuangan)\n\n' +
                    'Yang aman untuk diinput ke AI:\n' +
                    '• Pertanyaan umum tentang SOP atau prosedur kerja (tanpa data pelanggan di dalamnya)\n' +
                    '• Draft komunikasi dengan skenario fiktif/contoh (bukan kasus pelanggan asli)\n' +
                    '• Ringkasan dokumen yang memang sudah bersifat internal-umum, bukan rahasia\n\n' +
                    'Aktivitas diskusi: instruktur akan menunjukkan 3-4 contoh dokumen kerja sehari-hari (draft surat, data pelanggan, SOP, notulen rapat). Diskusikan bersama kelompok Anda: mana yang aman diinput ke AI publik, dan mana yang tidak - dan kenapa.\n\n' +
                    'Setelah diskusi, isi checklist keamanan data di bagian tugas sesi ini sebagai komitmen pribadi Anda.',
                },
                {
                  order: 4,
                  kind: LessonKind.Practice,
                  contentType: ContentType.Text,
                  title: 'Bagian C — Setup & Koneksi Tool Kerja',
                  content:
                    'Kenalkan tool AI yang sudah terhubung ke ekosistem kerja yang Anda pakai setiap hari:\n' +
                    '• Gemini - terhubung ke Google Drive, Docs, Sheets, Gmail. Sudah tersedia di akun Google Workspace kantor.\n' +
                    '• Copilot - terhubung ke Word, Excel, PowerPoint, Outlook. Native di MS Office yang dipakai semua karyawan.\n' +
                    '• ChatGPT/Claude (opsional) - berdiri sendiri, upload file manual. Untuk kebutuhan di luar dua ekosistem di atas.\n\n' +
                    'Langkah setup (15-20 menit) - lakukan sekarang bersama instruktur:\n' +
                    '1. Login ke Gemini/Copilot memakai akun kerja resmi Anda (bukan akun Gmail/Microsoft pribadi).\n' +
                    '2. Buka pengaturan privasi tool tersebut. Jika Anda memakai versi gratis, matikan opsi "gunakan data saya untuk melatih AI" atau sejenisnya.\n' +
                    '3. Buka satu dokumen kerja asli langsung dari Google Drive atau OneDrive Anda melalui tool AI ini, untuk memastikan koneksinya benar-benar berfungsi.\n' +
                    '4. Jika berhasil membuka dokumen tersebut, setup Anda sudah siap dipakai untuk project praktik di bagian berikutnya.',
                },
                {
                  order: 5,
                  kind: LessonKind.Practice,
                  contentType: ContentType.Text,
                  title: 'Bagian D — Project Praktik: Pilih Satu',
                  content:
                    'Pilih SATU project di bawah ini untuk dikerjakan sekarang. Jika ragu, kerjakan Project 1 - ini yang paling langsung terasa manfaatnya untuk pekerjaan sehari-hari.\n\n' +
                    'Project 1 - Ringkas SOP/peraturan jadi poin sederhana (Direkomendasikan)\n' +
                    'Pakai Gemini (di Docs) atau Copilot (di Word). Ambil satu SOP yang sering Anda pakai, lalu minta AI meringkasnya jadi 5-10 poin actionable yang mudah diingat.\n' +
                    'Contoh prompt: "Ringkas SOP ini menjadi 5-10 poin actionable yang mudah diikuti oleh petugas lapangan. Gunakan bahasa sederhana."\n\n' +
                    'Project 2 - Cari & rapikan info dari file lama\n' +
                    'Pakai fitur pencarian AI di Google Drive atau OneDrive untuk menemukan satu file lama yang biasanya susah dicari. Minta AI merangkum isinya.\n\n' +
                    'Project 3 - Draft balasan WA/email standar\n' +
                    'Pakai ChatGPT atau Copilot untuk membuat 3 draft balasan untuk skenario komunikasi rutin. Gunakan skenario FIKTIF, bukan data pelanggan asli (ingat Bagian B).\n\n' +
                    'Project 4 - Bandingkan 2 tool untuk 1 pertanyaan sama\n' +
                    'Coba Gemini dan Copilot untuk pertanyaan kerja yang sama. Catat mana yang terasa lebih pas untuk gaya kerja Anda, dan kenapa.\n\n' +
                    'Setelah selesai, submit hasilnya di bagian tugas "Hasil Project Praktik" - cukup tempel link dokumen hasil kerja Anda (Google Docs/Sheets atau OneDrive).',
                },
              ],
            },
            assignments: {
              create: [
                {
                  instructions:
                    'Checklist Keamanan Data Pribadi: setelah mengikuti diskusi Bagian B, tuliskan komitmen Anda dalam format berikut - (1) 3 contoh data yang TIDAK akan Anda input ke AI publik, (2) 2 contoh data/pertanyaan yang aman untuk diinput ke AI, (3) satu kalimat komitmen pribadi Anda menjaga data pelanggan saat memakai AI.',
                  submissionType: SubmissionType.Text,
                },
                {
                  instructions:
                    'Hasil Project Praktik Bagian D: tempel link dokumen hasil project yang Anda pilih (Project 1, 2, 3, atau 4), lalu tuliskan 1-2 kalimat: project mana yang dipilih dan apa hasil yang didapat.',
                  submissionType: SubmissionType.Link,
                },
              ],
            },
          },
        ],
      },
    },
    include: { sessions: { include: { lessons: true, assignments: true } } },
  });

  // 5. Modul 2: Teknik Prompting Terapan - three sessions, locked behind
  // Modul 1. Templates #2 and #4 are flagged isAdvancedMaterial: they feed a
  // future automation module without being re-derived from scratch.
  const module2 = await prisma.module.create({
    data: {
      title: 'Modul 2: Teknik Prompting Terapan',
      description:
        '3 sesi teknik prompting untuk komunikasi pelanggan, ringkasan dokumen, dan pelaporan rutin. Prasyarat: Modul 1 selesai.',
      createdByEditorId: editor.id,
      prerequisiteModuleId: module1.id,
      sessions: {
        create: [
          {
            title: 'Sesi 1: Fondasi Prompting + Komunikasi Pelanggan',
            order: 1,
            lessons: {
              create: [
                {
                  order: 1,
                  kind: LessonKind.Objectives,
                  contentType: ContentType.Text,
                  title: 'Tujuan Belajar Sesi Ini',
                  content:
                    'Setelah sesi ini, Anda mampu:\n' +
                    '1. Menyusun prompt memakai framework konteks-tugas-format-contoh.\n' +
                    '2. Membuat draft balasan status permohonan pelanggan yang sesuai gaya bahasa kantor.\n' +
                    '3. Mengiterasi prompt ketika hasil AI kurang pas.',
                },
                {
                  order: 2,
                  kind: LessonKind.Summary,
                  contentType: ContentType.Text,
                  title: 'Framework Prompting: Konteks → Tugas → Format → Contoh',
                  content:
                    'Prompt yang bagus punya 4 bagian:\n' +
                    '1. KONTEKS - siapa Anda, situasinya apa. Contoh: "Saya petugas pelayanan pelanggan."\n' +
                    '2. TUGAS - apa yang Anda minta AI lakukan, sejelas mungkin. Contoh: "Buatkan draft balasan untuk permohonan tambah daya."\n' +
                    '3. FORMAT - bagaimana bentuk hasilnya. Contoh: "Dalam 3-4 kalimat, nada formal tapi ramah."\n' +
                    '4. CONTOH (opsional tapi sangat membantu) - beri satu contoh gaya yang Anda inginkan, AI akan meniru polanya.\n\n' +
                    'Studi kasus yang akan Anda praktikkan di sesi ini: draft balasan status permohonan pelanggan (pasang baru, tambah daya, atau sambungan sementara), dan draft respons untuk keluhan pelanggan standar.',
                },
                {
                  order: 3,
                  kind: LessonKind.Practice,
                  contentType: ContentType.Text,
                  title: 'Instruksi Praktik: Draft Balasan & Respons Keluhan',
                  content:
                    'Langkah-langkah:\n' +
                    '1. Ambil satu permohonan atau keluhan pelanggan nyata dari pekerjaan Anda (boleh dianonimkan - hilangkan nama dan data pribadi pelanggan, ingat aturan keamanan data di Modul 1).\n' +
                    '2. Susun prompt memakai framework Konteks-Tugas-Format-Contoh untuk membuat draft balasannya.\n' +
                    '3. Baca hasil AI. Jika nadanya kurang sesuai gaya kantor, atau isinya kurang lengkap, revisi prompt Anda dan coba lagi - ini disebut iterasi prompt.\n' +
                    '4. Ulangi langkah 1-3 untuk kasus komunikasi pelanggan yang kedua: draft respons keluhan standar.\n' +
                    '5. Submit kedua draft final Anda di bagian tugas sesi ini.',
                },
              ],
            },
            assignments: {
              create: [
                {
                  instructions:
                    'Template Balasan Status Permohonan Pelanggan: tulis 1 template prompt pribadi (disesuaikan gaya kerja Anda, bukan generik) untuk membalas status permohonan pelanggan (pasang baru/tambah daya/sambungan sementara), beserta contoh hasil balasannya.',
                  submissionType: SubmissionType.Text,
                },
                {
                  instructions:
                    'Template Respons Keluhan Pelanggan Standar: tulis 1 template prompt pribadi untuk merespons keluhan pelanggan standar, beserta contoh hasilnya. Template ini akan dipakai lagi sebagai bahan modul otomatisasi lanjutan.',
                  submissionType: SubmissionType.Text,
                  isAdvancedMaterial: true,
                },
              ],
            },
          },
          {
            title: 'Sesi 2: Ekstraksi & Ringkas Dokumen Panjang',
            order: 2,
            lessons: {
              create: [
                {
                  order: 1,
                  kind: LessonKind.Objectives,
                  contentType: ContentType.Text,
                  title: 'Tujuan Belajar Sesi Ini',
                  content:
                    'Setelah sesi ini, Anda mampu meringkas SOP atau dokumen panjang menjadi checklist kerja singkat yang actionable memakai AI.',
                },
                {
                  order: 2,
                  kind: LessonKind.Summary,
                  contentType: ContentType.Text,
                  title: 'Kenapa Ini Penting',
                  content:
                    'Dari survei kebutuhan pelatihan, ini adalah gap terbesar kedua: 62% karyawan ingin bisa meringkas dokumen panjang dengan AI, tapi baru 33% yang sudah bisa melakukannya. SOP penanganan gangguan, kontrak manajemen, dan dokumen panjang lain sering tidak sempat dibaca lengkap - padahal isinya penting untuk pekerjaan sehari-hari.\n\n' +
                    'Studi kasus sesi ini: meringkas SOP penanganan gangguan/keluhan, atau kontrak manajemen, menjadi checklist kerja singkat.',
                },
                {
                  order: 3,
                  kind: LessonKind.Practice,
                  contentType: ContentType.Text,
                  title: 'Instruksi Praktik: Ringkas Jadi Checklist',
                  content:
                    'Langkah-langkah:\n' +
                    '1. Ambil satu SOP atau dokumen panjang yang relevan dengan tugas Anda sehari-hari.\n' +
                    '2. Buka dokumen tersebut lewat Gemini (Docs) atau Copilot (Word) - bukan copy-paste manual, biarkan AI membaca dokumennya langsung.\n' +
                    '3. Minta AI meringkas isinya menjadi 5-10 poin actionable, dalam bahasa yang mudah diikuti.\n' +
                    '4. Periksa ringkasannya: apakah ada poin penting yang terlewat atau salah dipahami AI? Jika ada, revisi prompt Anda dan minta AI memperbaikinya.\n' +
                    '5. Submit checklist final Anda di bagian tugas sesi ini.',
                },
              ],
            },
            assignments: {
              create: [
                {
                  instructions:
                    'Template Ringkasan SOP/Dokumen Panjang → Checklist: tulis 1 template prompt pribadi untuk meringkas SOP/dokumen panjang menjadi checklist kerja, beserta contoh hasil checklist-nya.',
                  submissionType: SubmissionType.Text,
                },
              ],
            },
          },
          {
            title: 'Sesi 3: Notifikasi Internal & Laporan Rutin',
            order: 3,
            lessons: {
              create: [
                {
                  order: 1,
                  kind: LessonKind.Objectives,
                  contentType: ContentType.Text,
                  title: 'Tujuan Belajar Sesi Ini',
                  content:
                    'Setelah sesi ini, Anda mampu membuat template notifikasi internal ke PIC bidang dan ringkasan laporan rutin untuk atasan memakai AI.',
                },
                {
                  order: 2,
                  kind: LessonKind.Summary,
                  contentType: ContentType.Text,
                  title: 'Studi Kasus: Notifikasi & Laporan',
                  content:
                    'Dua kebutuhan komunikasi internal yang sering berulang: (1) notifikasi ke PIC bidang saat ada keluhan atau gangguan masuk, dan (2) ringkasan laporan status pekerjaan untuk atasan. Keduanya cocok dibuatkan template prompt sekali, dipakai berulang kali.',
                },
                {
                  order: 3,
                  kind: LessonKind.Practice,
                  contentType: ContentType.Text,
                  title: 'Instruksi Praktik: Template Notifikasi & Laporan',
                  content:
                    'Langkah-langkah:\n' +
                    '1. Buat template notifikasi ke PIC bidang untuk kasus keluhan/gangguan yang masuk - sertakan informasi apa saja yang wajib ada (lokasi, jenis gangguan, tingkat urgensi).\n' +
                    '2. Coba template tersebut dengan AI. Jika hasilnya kurang spesifik atau kurang sesuai SOP eskalasi, revisi prompt Anda dan iterasi lagi.\n' +
                    '3. Buat template kedua: ringkasan laporan status pekerjaan untuk atasan, dari catatan kerja mingguan/bulanan Anda.\n' +
                    '4. Submit kedua template final di bagian tugas sesi ini.',
                },
              ],
            },
            assignments: {
              create: [
                {
                  instructions:
                    'Template Notifikasi ke PIC Bidang: tulis 1 template prompt pribadi untuk notifikasi ke PIC bidang saat ada keluhan/gangguan masuk, beserta contoh hasilnya. Template ini akan dipakai lagi sebagai bahan modul otomatisasi lanjutan.',
                  submissionType: SubmissionType.Text,
                  isAdvancedMaterial: true,
                },
                {
                  instructions:
                    'Template Ringkasan Laporan Rutin untuk Atasan: tulis 1 template prompt pribadi untuk meringkas laporan status mingguan/bulanan Anda untuk atasan, beserta contoh hasilnya.',
                  submissionType: SubmissionType.Text,
                },
              ],
            },
          },
        ],
      },
    },
    include: { sessions: { include: { lessons: true, assignments: true } } },
  });

  // 6. Publish both modules platform-wide - visible to every Student with All-Access.
  await prisma.module.update({ where: { id: module1.id }, data: { isPublished: true } });
  await prisma.module.update({ where: { id: module2.id }, data: { isPublished: true } });

  // 7. Demo progress data, deliberately non-uniform:
  // Alice has finished Modul 1 (all lessons done, both assignments graded),
  // which unlocks Modul 2 for her, and she has started its first session.
  // Bob is partway through Modul 1, with one ungraded submission sitting in
  // the grading queue, and Modul 2 stays locked for him.
  const module1Session = module1.sessions[0];
  const [checklistAssignment, projectAssignment] = module1Session.assignments;

  const aliceChecklistSubmission = await prisma.submission.create({
    data: {
      assignmentId: checklistAssignment.id,
      userId: alice.id,
      content:
        '(1) Tidak akan input: nomor pelanggan, alamat pelanggan, data teknis lokasi gardu. ' +
        '(2) Aman diinput: pertanyaan umum SOP, draft dengan skenario fiktif. ' +
        '(3) Saya akan selalu mengecek ulang data pelanggan sebelum menempelkannya ke prompt AI apa pun.',
      status: SubmissionStatus.Graded,
    },
  });
  await prisma.grade.create({
    data: {
      submissionId: aliceChecklistSubmission.id,
      gradedByEditorId: editor.id,
      passFail: true,
      feedbackText: 'Lengkap dan jelas, terima kasih.',
    },
  });

  const aliceProjectSubmission = await prisma.submission.create({
    data: {
      assignmentId: projectAssignment.id,
      userId: alice.id,
      content:
        'https://docs.google.com/document/d/contoh-ringkasan-sop-alice - Project 1: meringkas SOP penanganan keluhan pelanggan jadi 7 poin actionable.',
      status: SubmissionStatus.Graded,
    },
  });
  await prisma.grade.create({
    data: {
      submissionId: aliceProjectSubmission.id,
      gradedByEditorId: editor.id,
      score: 90,
      feedbackText: 'Ringkasannya sudah actionable, bagus.',
    },
  });

  await prisma.sessionProgress.create({
    data: {
      userId: alice.id,
      sessionId: module1Session.id,
      lessonsCompletedCount: module1Session.lessons.length,
      assignmentStatus: AssignmentStatus.Graded,
    },
  });

  const module2Session1 = module2.sessions.find((s) => s.order === 1)!;
  await prisma.sessionProgress.create({
    data: {
      userId: alice.id,
      sessionId: module2Session1.id,
      lessonsCompletedCount: 2,
      assignmentStatus: AssignmentStatus.NotStarted,
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: checklistAssignment.id,
      userId: bob.id,
      content:
        '(1) Tidak akan input: nomor pelanggan, data teknis jaringan. (2) Aman diinput: pertanyaan SOP umum. (3) Saya akan menjaga data pelanggan saat memakai AI.',
      status: SubmissionStatus.Pending,
    },
  });
  await prisma.sessionProgress.create({
    data: {
      userId: bob.id,
      sessionId: module1Session.id,
      lessonsCompletedCount: 3,
      assignmentStatus: AssignmentStatus.Pending,
    },
  });

  // 8. Resource library starter kit - example templates peserta must adapt
  // to their own work, not copy verbatim, plus a short guide framing that.
  await prisma.resourceItem.create({
    data: {
      type: ResourceType.Guide,
      title: 'Cara Memakai Starter Kit Ini',
      content:
        'Template di bawah ini adalah TITIK AWAL, bukan jawaban jadi. Ganti bagian dalam tanda kurung siku [seperti ini] dengan konteks pekerjaan Anda sendiri, lalu sesuaikan nada dan detailnya sampai terasa seperti gaya Anda - persis seperti yang dipraktikkan di Modul 2.',
      tags: ['starter-kit'],
    },
  });

  const starterKitTemplates = [
    {
      title: 'Draft Balasan Email Rutin',
      content:
        'Tulis balasan email untuk [situasi]. Nada: formal tapi ramah. Panjang: 3-5 kalimat. Sertakan: [informasi wajib]. Contoh gaya yang saya suka: [tempel contoh email sebelumnya di sini].',
      category: 'email',
    },
    {
      title: 'Follow-up Email ke Rekan Kerja',
      content:
        'Buatkan email follow-up untuk [topik] ke [nama jabatan, bukan nama pribadi]. Ingatkan tentang [poin yang perlu ditindaklanjuti]. Nada sopan dan tidak terkesan menagih.',
      category: 'email',
    },
    {
      title: 'Email Permintaan Data ke Bidang Lain',
      content:
        'Buatkan email meminta data [jenis data] dari bidang [nama bidang]. Jelaskan singkat kenapa data ini dibutuhkan dan kapan batas waktunya.',
      category: 'email',
    },
    {
      title: 'Email Konfirmasi Jadwal',
      content:
        'Buatkan email konfirmasi jadwal [nama kegiatan] pada [tanggal/waktu] kepada [penerima]. Sertakan lokasi dan hal yang perlu disiapkan peserta.',
      category: 'email',
    },
    {
      title: 'Ringkasan Laporan Mingguan',
      content:
        'Dari catatan kerja berikut: [tempel catatan kerja mingguan Anda], buatkan ringkasan laporan mingguan dalam 5 poin: pekerjaan selesai, pekerjaan berjalan, kendala, rencana minggu depan, dan catatan tambahan.',
      category: 'laporan',
    },
    {
      title: 'Notifikasi Gangguan ke PIC Bidang',
      content:
        'Buatkan notifikasi gangguan untuk PIC bidang [nama bidang]. Info: lokasi [lokasi], jenis gangguan [jenis], tingkat urgensi [rendah/sedang/tinggi], waktu ditemukan [waktu]. Format singkat, siap dikirim lewat WhatsApp/email.',
      category: 'laporan',
    },
    {
      title: 'Ringkasan Rapat jadi Notulen',
      content:
        'Dari catatan rapat berikut: [tempel catatan rapat], buatkan notulen singkat berisi: peserta, poin pembahasan utama, keputusan yang diambil, dan tindak lanjut (siapa mengerjakan apa, kapan).',
      category: 'laporan',
    },
    {
      title: 'Laporan Status Proyek untuk Atasan',
      content:
        'Buatkan ringkasan status proyek [nama proyek] untuk atasan, dalam format: progres saat ini (%), pencapaian minggu ini, kendala yang perlu perhatian atasan, dan bantuan yang dibutuhkan.',
      category: 'laporan',
    },
    {
      title: 'Ringkas SOP jadi Poin Actionable',
      content:
        'Ringkas SOP berikut menjadi 5-10 poin actionable yang mudah diikuti oleh petugas lapangan. Gunakan bahasa sederhana, hindari istilah teknis yang tidak dijelaskan: [tempel isi SOP].',
      category: 'ringkasan',
    },
    {
      title: 'Ringkas Dokumen Panjang jadi Checklist',
      content:
        'Dari dokumen berikut: [tempel/lampirkan dokumen], buatkan checklist kerja berisi langkah-langkah utama yang harus dilakukan, diurutkan sesuai prioritas.',
      category: 'ringkasan',
    },
    {
      title: 'Ringkas Kontrak/Perjanjian untuk Dipahami Cepat',
      content:
        'Ringkas poin-poin penting dari kontrak/perjanjian berikut: kewajiban tiap pihak, jangka waktu, dan hal-hal yang perlu diwaspadai. Gunakan bahasa non-hukum yang mudah dipahami: [tempel isi dokumen].',
      category: 'ringkasan',
    },
    {
      title: 'Bandingkan Dua Dokumen/Versi SOP',
      content:
        'Bandingkan SOP versi lama dan versi baru berikut, lalu ringkas apa saja yang berubah dalam bentuk poin-poin: [tempel SOP lama] [tempel SOP baru].',
      category: 'ringkasan',
    },
  ];

  for (const template of starterKitTemplates) {
    await prisma.resourceItem.create({
      data: {
        type: ResourceType.Template,
        title: template.title,
        content: template.content,
        tags: ['starter-kit', template.category],
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log(`\nAll seeded users share the password: ${DEFAULT_PASSWORD}`);
  console.log('  charlie@kelas.ai   -> Editor');
  console.log(
    '  alice@kelas.ai     -> Student, All-Access (finished Modul 1, started Modul 2 Sesi 1)',
  );
  console.log(
    '  bob@kelas.ai       -> Student, no All-Access yet (hits the paywall on /student/modules)',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
