-- Leads: email becomes optional.
--
-- The AI-agent callback widget in the site header collects a name and a phone
-- number and nothing else — it interrupts, so it asks for the least that still
-- lets someone be called back. `email not null` refused those rows outright
-- (23502), so the widget could not store a lead at all.
--
-- Every lead still has a way to reach the person: the API requires an email
-- from the contact form and a phone number from the callback widget. That rule
-- cannot live in a column check, because the constraint cannot see which form
-- the row came from.
--
-- Run this in the Supabase SQL editor. Until it is applied the API falls back
-- to storing an empty string, which the admin already renders as "no address" —
-- so the widget works either way, this just makes the data honest.
--
-- To reverse: backfill, then re-add the constraint.
--   update public.leads set email = '' where email is null;
--   alter table public.leads alter column email set not null;

alter table public.leads
  alter column email drop not null;

-- Tidy any rows the pre-migration fallback wrote, so "no email" is one value
-- rather than two that behave the same everywhere but read differently.
update public.leads
   set email = null
 where email = '';
