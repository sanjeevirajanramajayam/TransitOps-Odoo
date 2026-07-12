-- CreateTable
CREATE TABLE "transit_document" (
    "id" SERIAL NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "document_type" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transit_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transit_document_entity_type_entity_id_idx" ON "transit_document"("entity_type", "entity_id");
