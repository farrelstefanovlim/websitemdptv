-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('pending', 'interview', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'excused');

-- CreateEnum
CREATE TYPE "KegiatanStatus" AS ENUM ('draft', 'diajukan', 'disetujui', 'ditolak', 'selesai');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "division_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "subtitle" VARCHAR(100),
    "description" TEXT,
    "image_url" VARCHAR(500),
    "features" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicants" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nim" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "division_id" UUID NOT NULL,
    "motivation" TEXT NOT NULL,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "reviewed_by" UUID,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegiatan" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "division_id" UUID,
    "event_date" DATE NOT NULL,
    "location" VARCHAR(200),
    "status" "KegiatanStatus" NOT NULL DEFAULT 'draft',
    "pic_id" UUID,
    "budget" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_files" (
    "id" UUID NOT NULL,
    "kegiatan_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(50),
    "file_size" INTEGER,
    "file_url" VARCHAR(500) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layout_sections" (
    "id" UUID NOT NULL,
    "section_key" VARCHAR(30) NOT NULL,
    "label" VARCHAR(50),
    "icon" VARCHAR(50),
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,

    CONSTRAINT "layout_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_contents" (
    "id" UUID NOT NULL,
    "section_key" VARCHAR(30) NOT NULL,
    "content" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "section_contents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" UUID NOT NULL,
    "section_key" VARCHAR(30) NOT NULL DEFAULT 'documentation',
    "label" VARCHAR(100),
    "title" VARCHAR(200),
    "image_url" VARCHAR(500) NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "key" VARCHAR(50) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "divisions_name_key" ON "divisions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "applicants_nim_key" ON "applicants"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_member_id_date_key" ON "attendance_records"("member_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_files_kegiatan_id_key" ON "proposal_files"("kegiatan_id");

-- CreateIndex
CREATE UNIQUE INDEX "layout_sections_section_key_key" ON "layout_sections"("section_key");

-- CreateIndex
CREATE UNIQUE INDEX "section_contents_section_key_key" ON "section_contents"("section_key");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_files" ADD CONSTRAINT "proposal_files_kegiatan_id_fkey" FOREIGN KEY ("kegiatan_id") REFERENCES "kegiatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_contents" ADD CONSTRAINT "section_contents_section_key_fkey" FOREIGN KEY ("section_key") REFERENCES "layout_sections"("section_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_section_key_fkey" FOREIGN KEY ("section_key") REFERENCES "section_contents"("section_key") ON DELETE RESTRICT ON UPDATE CASCADE;
