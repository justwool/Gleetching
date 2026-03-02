ALTER TABLE "SiteSettings"
ADD COLUMN "wordmarkPlacement" TEXT NOT NULL DEFAULT 'RIGHT',
ADD COLUMN "wordmarkBarFollowsFiglet" BOOLEAN NOT NULL DEFAULT true;
