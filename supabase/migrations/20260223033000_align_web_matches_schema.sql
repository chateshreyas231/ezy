-- Align production DB with web/app expectations for matches table.

ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS explanation text;

COMMENT ON COLUMN public.matches.explanation IS 'Reason for match creation, used by web/mobile UI.';
