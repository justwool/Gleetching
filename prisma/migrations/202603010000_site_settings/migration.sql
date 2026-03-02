CREATE TABLE "SiteSettings" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "figletFont" TEXT NOT NULL DEFAULT 'Small',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "figletFont", "updatedAt")
VALUES (1, 'Small', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
