-- Split "name" into firstName / lastName
ALTER TABLE "pilots" ADD COLUMN "firstName" TEXT;
ALTER TABLE "pilots" ADD COLUMN "lastName" TEXT;

UPDATE "pilots"
SET
  "firstName" = split_part("name", ' ', 1),
  "lastName" = CASE
    WHEN position(' ' in "name") > 0
    THEN NULLIF(trim(substring("name" from position(' ' in "name") + 1)), '')
    ELSE NULL
  END;

-- Anything with no space in the original name (single-word name) gets an
-- empty last name rather than NULL, so the column can be made required.
UPDATE "pilots" SET "lastName" = '' WHERE "lastName" IS NULL;

ALTER TABLE "pilots" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "pilots" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "pilots" DROP COLUMN "name";

-- Address + experience fields from the intake form
ALTER TABLE "pilots" ADD COLUMN "street1" TEXT;
ALTER TABLE "pilots" ADD COLUMN "street2" TEXT;
ALTER TABLE "pilots" ADD COLUMN "city" TEXT;
ALTER TABLE "pilots" ADD COLUMN "state" TEXT;
ALTER TABLE "pilots" ADD COLUMN "zipCode" TEXT;
ALTER TABLE "pilots" ADD COLUMN "picTotalTime" TEXT;
ALTER TABLE "pilots" ADD COLUMN "motivation" TEXT;

-- Rename to match the intake form's language
ALTER TABLE "pilots" RENAME COLUMN "qualifications" TO "airmenRatings";

-- Aircraft can now be added without a tail number (the intake form doesn't
-- collect one); still unique when one is provided.
ALTER TABLE "aircraft" ALTER COLUMN "nNumber" DROP NOT NULL;
