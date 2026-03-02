-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ident" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "tags" TEXT[],
    "accentColor" TEXT NOT NULL DEFAULT '#8eb8b8',
    "dividerSet" TEXT NOT NULL DEFAULT 'pipe',
    "headerStyle" TEXT NOT NULL DEFAULT 'stack',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Piece" (
    "id" TEXT NOT NULL,
    "pieceId" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "collectionId" TEXT NOT NULL,
    "viewerUrl" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "pngUrl" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    CONSTRAINT "Piece_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");
CREATE UNIQUE INDEX "Collection_ident_key" ON "Collection"("ident");
CREATE UNIQUE INDEX "Piece_pieceId_key" ON "Piece"("pieceId");
CREATE UNIQUE INDEX "Piece_serial_key" ON "Piece"("serial");
CREATE INDEX "Piece_collectionId_capturedAt_idx" ON "Piece"("collectionId", "capturedAt");
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- AddForeignKey
ALTER TABLE "Piece" ADD CONSTRAINT "Piece_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
