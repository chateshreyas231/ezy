-- Migration 031: Create comprehensive default task templates
-- This migration updates the trigger to create a full set of tasks covering the entire real estate transaction

-- ============================================
-- STEP 1: Backfill conversations for existing deal rooms
-- ============================================

-- Create conversations for deal rooms that don't have them
INSERT INTO conversations (deal_room_id)
SELECT dr.id
FROM deal_rooms dr
WHERE NOT EXISTS (
  SELECT 1 FROM conversations c WHERE c.deal_room_id = dr.id
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 2: Update the trigger function
-- ============================================

-- Drop the existing trigger function
DROP FUNCTION IF EXISTS create_deal_room_for_match() CASCADE;

-- Create enhanced function with comprehensive task creation
CREATE OR REPLACE FUNCTION create_deal_room_for_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_deal_room_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Create deal room
  INSERT INTO deal_rooms (match_id, status)
  VALUES (NEW.id, 'matched')
  RETURNING id INTO new_deal_room_id;

  -- Create participants
  INSERT INTO deal_participants (deal_room_id, profile_id, role_in_deal)
  VALUES 
    (new_deal_room_id, NEW.buyer_id, 'buyer'),
    (new_deal_room_id, NEW.seller_id, 'seller')
  ON CONFLICT DO NOTHING;

  -- Create conversation
  INSERT INTO conversations (deal_room_id)
  VALUES (new_deal_room_id)
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- PRE-OFFER PHASE - Buyer Tasks
  -- ============================================
  INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
  VALUES
    (new_deal_room_id, NEW.buyer_id, 'Review Property Details', 'Carefully review all property information, photos, and listing details', 'pre_offer', 1, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Schedule Property Showing', 'Coordinate with seller to schedule an in-person property tour', 'pre_offer', 2, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Get Pre-Approval Letter', 'Obtain mortgage pre-approval from your lender', 'pre_offer', 3, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Review Neighborhood', 'Research schools, amenities, commute times, and local market trends', 'pre_offer', 4, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Prepare Offer', 'Work with your agent to prepare a competitive offer', 'pre_offer', 5, 'todo');

  -- PRE-OFFER PHASE - Seller Tasks
  INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
  VALUES
    (new_deal_room_id, NEW.seller_id, 'Prepare Property for Showing', 'Clean, declutter, and stage property for buyer visits', 'pre_offer', 1, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Complete Seller Disclosures', 'Fill out all required property disclosure forms', 'pre_offer', 2, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Confirm Showing Availability', 'Provide available times for property showings', 'pre_offer', 3, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Review Offers', 'Review and evaluate incoming buyer offers', 'pre_offer', 4, 'todo');

  -- ============================================
  -- DUE DILIGENCE PHASE - Buyer Tasks
  -- ============================================
  INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
  VALUES
    (new_deal_room_id, NEW.buyer_id, 'Schedule Home Inspection', 'Hire and schedule professional home inspector', 'due_diligence', 1, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Review Inspection Report', 'Carefully review inspection findings and discuss with your agent', 'due_diligence', 2, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Order Pest Inspection', 'Schedule termite/pest inspection if required', 'due_diligence', 3, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Review Title Report', 'Examine title search results for any issues or liens', 'due_diligence', 4, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Order Appraisal', 'Schedule property appraisal with lender', 'due_diligence', 5, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Review HOA Documents', 'If applicable, review HOA rules, fees, and financials', 'due_diligence', 6, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Request Repairs/Credits', 'Submit repair requests or credit negotiations based on inspection', 'due_diligence', 7, 'todo');

  -- DUE DILIGENCE PHASE - Seller Tasks
  INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
  VALUES
    (new_deal_room_id, NEW.seller_id, 'Provide Access for Inspections', 'Coordinate access for buyer inspections and appraisals', 'due_diligence', 1, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Respond to Repair Requests', 'Review and respond to buyer repair requests or credit negotiations', 'due_diligence', 2, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Complete Agreed Repairs', 'Complete any agreed-upon repairs before closing', 'due_diligence', 3, 'todo');

  -- ============================================
  -- FINANCING PHASE - Buyer Tasks
  -- ============================================
  INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
  VALUES
    (new_deal_room_id, NEW.buyer_id, 'Submit Loan Application', 'Complete and submit formal mortgage application', 'financing', 1, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Provide Financial Documents', 'Submit pay stubs, tax returns, bank statements to lender', 'financing', 2, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Lock Interest Rate', 'Lock in your mortgage interest rate with lender', 'financing', 3, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Clear Loan Conditions', 'Provide any additional documents requested by underwriter', 'financing', 4, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Get Final Loan Approval', 'Receive clear to close from lender', 'financing', 5, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Purchase Homeowners Insurance', 'Secure homeowners insurance policy for closing', 'financing', 6, 'todo');

  -- ============================================
  -- CLOSING PHASE - Buyer Tasks
  -- ============================================
  INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
  VALUES
    (new_deal_room_id, NEW.buyer_id, 'Review Closing Disclosure', 'Carefully review final closing costs and loan terms (3 days before closing)', 'closing', 1, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Schedule Final Walkthrough', 'Inspect property one last time before closing', 'closing', 2, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Complete Final Walkthrough', 'Verify property condition and agreed repairs completed', 'closing', 3, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Wire Closing Funds', 'Wire remaining down payment and closing costs to title company', 'closing', 4, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Attend Closing/Sign Documents', 'Sign all closing documents and finalize purchase', 'closing', 5, 'todo'),
    (new_deal_room_id, NEW.buyer_id, 'Receive Keys', 'Get keys and celebrate your new home!', 'closing', 6, 'todo');

  -- CLOSING PHASE - Seller Tasks
  INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
  VALUES
    (new_deal_room_id, NEW.seller_id, 'Complete Agreed Repairs', 'Finish all repairs agreed upon during negotiations', 'closing', 1, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Prepare for Final Walkthrough', 'Ensure property is clean and ready for buyer final walkthrough', 'closing', 2, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Move Out/Clean Property', 'Complete move-out and leave property broom-clean', 'closing', 3, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Attend Closing/Sign Documents', 'Sign all closing documents and transfer title', 'closing', 4, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Transfer Utilities', 'Coordinate utility transfers with buyer', 'closing', 5, 'todo'),
    (new_deal_room_id, NEW.seller_id, 'Hand Over Keys & Garage Openers', 'Provide all keys, garage openers, and manuals to buyer', 'closing', 6, 'todo');

  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_create_deal_room_on_match ON matches;

CREATE TRIGGER trigger_create_deal_room_on_match
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION create_deal_room_for_match();
