-- Migration 009: Seed Workflow Templates
-- Inserts workflow templates for all roles and stages

-- ============================================================
-- BUYER TEMPLATES
-- ============================================================

-- active_search stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer.active_search.upload_preapproval', 'active_search', 'buyer', 'Upload Pre-Approval', 'Upload your mortgage pre-approval letter', 7, '{}'),
('buyer.active_search.define_intent', 'active_search', 'buyer', 'Define Search Intent', 'Describe what you are looking for in natural language', 3, '{}'),
('buyer.active_search.save_areas', 'active_search', 'buyer', 'Save 3 Preferred Areas', 'Identify and save your top 3 preferred neighborhoods or areas', 5, ARRAY['Define Search Intent']);

-- touring stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer.touring.request_tour', 'touring', 'buyer', 'Request Tour', 'Request a property tour for listings you are interested in', 1, '{}'),
('buyer.touring.confirm_tour', 'touring', 'buyer', 'Confirm Tour', 'Confirm your scheduled tour date and time', 1, ARRAY['Request Tour']),
('buyer.touring.provide_availability', 'touring', 'buyer', 'Provide Availability Windows', 'Share your availability for property viewings', 2, ARRAY['Request Tour']);

-- offer_submitted stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer.offer_submitted.review_summary', 'offer_submitted', 'buyer', 'Review Offer Summary', 'Review the complete offer summary and terms', 1, '{}'),
('buyer.offer_submitted.confirm_terms', 'offer_submitted', 'buyer', 'Confirm Offer Terms', 'Confirm all offer terms including price, contingencies, and timeline', 2, ARRAY['Review Offer Summary']);

-- under_contract stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer.under_contract.earnest_money', 'under_contract', 'buyer', 'Deliver Earnest Money Deposit', 'Submit earnest money deposit as specified in contract', 3, '{}'),
('buyer.under_contract.schedule_inspection', 'under_contract', 'buyer', 'Schedule Home Inspection', 'Schedule and coordinate home inspection', 7, ARRAY['Deliver Earnest Money Deposit']);

-- inspection stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer.inspection.review_summary', 'inspection', 'buyer', 'Review Inspection Summary', 'Review the complete home inspection report', 3, ARRAY['Schedule Home Inspection']),
('buyer.inspection.approve_repairs', 'inspection', 'buyer', 'Approve Repairs Request', 'Review and approve or negotiate repair requests', 5, ARRAY['Review Inspection Summary']);

-- appraisal stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer.appraisal.lender_docs', 'appraisal', 'buyer', 'Submit Lender Documents', 'Provide all required documents to your lender', 7, '{}'),
('buyer.appraisal.review_appraisal', 'appraisal', 'buyer', 'Review Appraisal Report', 'Review the property appraisal report', 3, ARRAY['Submit Lender Documents']);

-- title stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer.title.review_title', 'title', 'buyer', 'Review Title Documents', 'Review title search and title insurance documents', 5, '{}');

-- closing stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer.closing.final_walkthrough', 'closing', 'buyer', 'Final Walkthrough', 'Conduct final walkthrough of the property', 2, '{}'),
('buyer.closing.sign_closing_docs', 'closing', 'buyer', 'Sign Closing Documents', 'Sign all closing documents and finalize transaction', 1, ARRAY['Final Walkthrough']);

-- ============================================================
-- SELLER TEMPLATES
-- ============================================================

-- listing_prep stage (for listing context, not deal)
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('seller.listing_prep.upload_photos', 'listing_prep', 'seller', 'Upload Photos', 'Upload professional photos of the property', 3, '{}'),
('seller.listing_prep.enter_disclosures', 'listing_prep', 'seller', 'Enter Disclosures', 'Complete and enter all required property disclosures', 5, ARRAY['Upload Photos']),
('seller.listing_prep.request_verification', 'listing_prep', 'seller', 'Request Listing Verification', 'Request platform verification of your listing', 2, ARRAY['Enter Disclosures']);

-- live stage (for listing context)
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('seller.live.verify_availability', 'live', 'seller', 'Verify Availability Weekly', 'Confirm property is still available and update status', 7, '{}'),
('seller.live.respond_to_leads', 'live', 'seller', 'Respond to Verified Leads', 'Respond to verified buyer inquiries within SLA', 1, '{}');

-- offer_review stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('seller.offer_review.review_comparison', 'offer_review', 'seller', 'Review Offer Comparison', 'Review and compare all received offers', 2, '{}'),
('seller.offer_review.counter_accept', 'offer_review', 'seller', 'Counter or Accept Offer', 'Make decision to counter or accept an offer', 3, ARRAY['Review Offer Comparison']),
('seller.offer_review.sign_agreement', 'offer_review', 'seller', 'Sign Purchase Agreement', 'Sign the purchase agreement', 1, ARRAY['Counter or Accept Offer']);

-- under_contract stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('seller.under_contract.provide_disclosures', 'under_contract', 'seller', 'Provide Property Disclosures', 'Provide all required disclosures to buyer', 5, '{}'),
('seller.under_contract.appraisal_coordination', 'under_contract', 'seller', 'Coordinate Appraisal', 'Coordinate property access for appraisal', 7, ARRAY['Provide Property Disclosures']),
('seller.under_contract.repairs_negotiation', 'under_contract', 'seller', 'Negotiate Repairs', 'Review and negotiate repair requests from buyer', 5, ARRAY['Coordinate Appraisal']),
('seller.under_contract.closing_signing', 'under_contract', 'seller', 'Sign Closing Documents', 'Sign all closing documents', 1, ARRAY['Negotiate Repairs']);

-- ============================================================
-- BUYER AGENT TEMPLATES
-- ============================================================

-- client_intake stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer_agent.client_intake.verify_docs', 'client_intake', 'buyerAgent', 'Verify Buyer Documents', 'Verify buyer identification and pre-approval documents', 2, '{}'),
('buyer_agent.client_intake.confirm_intent', 'client_intake', 'buyerAgent', 'Confirm Search Intent', 'Confirm and refine buyer search criteria', 1, ARRAY['Verify Buyer Documents']),
('buyer_agent.client_intake.create_tour_shortlist', 'client_intake', 'buyerAgent', 'Create Tour Shortlist', 'Create initial list of properties for buyer to tour', 3, ARRAY['Confirm Search Intent']);

-- touring stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer_agent.touring.schedule_tours', 'touring', 'buyerAgent', 'Schedule Tours', 'Schedule property tours for buyer', 2, '{}'),
('buyer_agent.touring.confirm_showing_details', 'touring', 'buyerAgent', 'Confirm Showing Details', 'Confirm all showing details with listing agents', 1, ARRAY['Schedule Tours']);

-- offer stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer_agent.offer.draft_offer', 'offer_submitted', 'buyerAgent', 'Draft Offer', 'Draft purchase offer with buyer input', 2, '{}'),
('buyer_agent.offer.send_counter', 'offer_negotiation', 'buyerAgent', 'Send Counter Offer', 'Send counter offer if initial offer is rejected', 3, ARRAY['Draft Offer']),
('buyer_agent.offer.finalize', 'offer_negotiation', 'buyerAgent', 'Finalize Offer Terms', 'Finalize all offer terms and conditions', 1, ARRAY['Send Counter Offer']);

-- under_contract stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('buyer_agent.under_contract.coordinate_inspector', 'under_contract', 'buyerAgent', 'Coordinate Inspector', 'Schedule and coordinate home inspector', 5, '{}'),
('buyer_agent.under_contract.coordinate_lender', 'under_contract', 'buyerAgent', 'Coordinate Lender', 'Coordinate with buyer lender for financing', 7, ARRAY['Coordinate Inspector']),
('buyer_agent.under_contract.coordinate_title', 'title', 'buyerAgent', 'Coordinate Title Company', 'Coordinate with title company for closing', 10, ARRAY['Coordinate Lender']);

-- ============================================================
-- SELLER AGENT TEMPLATES
-- ============================================================

-- listing stage (for listing context)
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('seller_agent.listing.optimize_listing', 'listing_prep', 'listingAgent', 'Optimize Listing', 'Optimize listing description, photos, and pricing', 3, '{}'),
('seller_agent.listing.verify_weekly', 'live', 'listingAgent', 'Verify Listing Weekly', 'Verify listing is still active and accurate', 7, '{}');

-- lead_pipeline stage (for listing context)
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('seller_agent.lead_pipeline.triage_leads', 'live', 'listingAgent', 'Triage Leads', 'Review and prioritize incoming buyer leads', 1, '{}'),
('seller_agent.lead_pipeline.follow_up', 'live', 'listingAgent', 'Follow Up with Leads', 'Follow up with qualified leads', 2, ARRAY['Triage Leads']),
('seller_agent.lead_pipeline.schedule_showings', 'live', 'listingAgent', 'Schedule Showings', 'Schedule property showings for interested buyers', 3, ARRAY['Follow Up with Leads']);

-- offer stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('seller_agent.offer.compare_offers', 'offer_review', 'listingAgent', 'Compare Offers', 'Compare all received offers and prepare comparison for seller', 2, '{}'),
('seller_agent.offer.counter', 'offer_negotiation', 'listingAgent', 'Send Counter Offer', 'Send counter offer to buyer agent', 3, ARRAY['Compare Offers']),
('seller_agent.offer.accept', 'offer_negotiation', 'listingAgent', 'Accept Offer', 'Accept offer and proceed to contract', 1, ARRAY['Compare Offers']);

-- under_contract stage
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('seller_agent.under_contract.coordinate_closing', 'under_contract', 'listingAgent', 'Coordinate Closing Tasks', 'Coordinate all closing-related tasks and documents', 14, '{}');

-- ============================================================
-- SUPPORTING ROLE TEMPLATES
-- ============================================================

-- Inspector
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('inspector.assigned.schedule', 'inspection', 'inspector', 'Schedule Inspection', 'Schedule property inspection with buyer and seller agents', 3, '{}'),
('inspector.assigned.upload_report', 'inspection', 'inspector', 'Upload Inspection Report', 'Complete and upload inspection report', 5, ARRAY['Schedule Inspection']),
('inspector.assigned.mark_complete', 'inspection', 'inspector', 'Mark Inspection Complete', 'Mark inspection as complete and notify parties', 1, ARRAY['Upload Inspection Report']);

-- Lawyer
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('lawyer.review.respond_questions', 'under_contract', 'lawyer', 'Respond to Legal Questions', 'Respond to legal questions from parties', 2, '{}'),
('lawyer.review.finalize_docs', 'title', 'lawyer', 'Finalize Legal Documents', 'Review and finalize all legal documents', 5, ARRAY['Respond to Legal Questions']);

-- Lender
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('lender.assigned.review_application', 'appraisal', 'lender', 'Review Loan Application', 'Review buyer loan application and documents', 5, '{}'),
('lender.assigned.finalize_approval', 'closing', 'lender', 'Finalize Loan Approval', 'Finalize loan approval and prepare closing documents', 7, ARRAY['Review Loan Application']);

-- Title
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('title.assigned.title_search', 'title', 'title', 'Conduct Title Search', 'Conduct comprehensive title search', 7, '{}'),
('title.assigned.prepare_closing', 'closing', 'title', 'Prepare Closing Documents', 'Prepare all closing documents', 3, ARRAY['Conduct Title Search']);

-- Appraiser
INSERT INTO workflow_templates (template_key, stage, assigned_role, title, description, due_in_days, dependency_titles) VALUES
('appraiser.assigned.schedule', 'appraisal', 'appraiser', 'Schedule Appraisal', 'Schedule property appraisal', 3, '{}'),
('appraiser.assigned.upload_report', 'appraisal', 'appraiser', 'Upload Appraisal Report', 'Complete and upload appraisal report', 5, ARRAY['Schedule Appraisal']),
('appraiser.assigned.mark_complete', 'appraisal', 'appraiser', 'Mark Appraisal Complete', 'Mark appraisal as complete', 1, ARRAY['Upload Appraisal Report']);

