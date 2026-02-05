-- Migration 032: Create comprehensive tasks for existing deal rooms
-- This backfills tasks for deal rooms that were created before the enhanced trigger

DO $$
DECLARE
  room RECORD;
  match_data RECORD;
BEGIN
  -- Loop through all deal rooms that don't have tasks
  FOR room IN 
    SELECT id as deal_room_id, match_id
    FROM deal_rooms
    WHERE NOT EXISTS (
      SELECT 1 FROM tasks t WHERE t.deal_room_id = deal_rooms.id
    )
  LOOP
    -- Get match details to know buyer and seller
    SELECT buyer_id, seller_id INTO match_data
    FROM matches
    WHERE id = room.match_id;

    IF match_data.buyer_id IS NOT NULL AND match_data.seller_id IS NOT NULL THEN
      -- ============================================
      -- PRE-OFFER PHASE - Buyer Tasks
      -- ============================================
      INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
      VALUES
        (room.deal_room_id, match_data.buyer_id, 'Review Property Details', 'Carefully review all property information, photos, and listing details', 'pre_offer', 1, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Schedule Property Showing', 'Coordinate with seller to schedule an in-person property tour', 'pre_offer', 2, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Get Pre-Approval Letter', 'Obtain mortgage pre-approval from your lender', 'pre_offer', 3, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Review Neighborhood', 'Research schools, amenities, commute times, and local market trends', 'pre_offer', 4, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Prepare Offer', 'Work with your agent to prepare a competitive offer', 'pre_offer', 5, 'todo');

      -- PRE-OFFER PHASE - Seller Tasks
      INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
      VALUES
        (room.deal_room_id, match_data.seller_id, 'Prepare Property for Showing', 'Clean, declutter, and stage property for buyer visits', 'pre_offer', 1, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Complete Seller Disclosures', 'Fill out all required property disclosure forms', 'pre_offer', 2, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Confirm Showing Availability', 'Provide available times for property showings', 'pre_offer', 3, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Review Offers', 'Review and evaluate incoming buyer offers', 'pre_offer', 4, 'todo');

      -- ============================================
      -- DUE DILIGENCE PHASE - Buyer Tasks
      -- ============================================
      INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
      VALUES
        (room.deal_room_id, match_data.buyer_id, 'Schedule Home Inspection', 'Hire and schedule professional home inspector', 'due_diligence', 1, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Review Inspection Report', 'Carefully review inspection findings and discuss with your agent', 'due_diligence', 2, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Order Pest Inspection', 'Schedule termite/pest inspection if required', 'due_diligence', 3, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Review Title Report', 'Examine title search results for any issues or liens', 'due_diligence', 4, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Order Appraisal', 'Schedule property appraisal with lender', 'due_diligence', 5, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Review HOA Documents', 'If applicable, review HOA rules, fees, and financials', 'due_diligence', 6, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Request Repairs/Credits', 'Submit repair requests or credit negotiations based on inspection', 'due_diligence', 7, 'todo');

      -- DUE DILIGENCE PHASE - Seller Tasks
      INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
      VALUES
        (room.deal_room_id, match_data.seller_id, 'Provide Access for Inspections', 'Coordinate access for buyer inspections and appraisals', 'due_diligence', 1, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Respond to Repair Requests', 'Review and respond to buyer repair requests or credit negotiations', 'due_diligence', 2, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Complete Agreed Repairs', 'Complete any agreed-upon repairs before closing', 'due_diligence', 3, 'todo');

      -- ============================================
      -- FINANCING PHASE - Buyer Tasks
      -- ============================================
      INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
      VALUES
        (room.deal_room_id, match_data.buyer_id, 'Submit Loan Application', 'Complete and submit formal mortgage application', 'financing', 1, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Provide Financial Documents', 'Submit pay stubs, tax returns, bank statements to lender', 'financing', 2, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Lock Interest Rate', 'Lock in your mortgage interest rate with lender', 'financing', 3, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Clear Loan Conditions', 'Provide any additional documents requested by underwriter', 'financing', 4, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Get Final Loan Approval', 'Receive clear to close from lender', 'financing', 5, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Purchase Homeowners Insurance', 'Secure homeowners insurance policy for closing', 'financing', 6, 'todo');

      -- ============================================
      -- CLOSING PHASE - Buyer Tasks
      -- ============================================
      INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
      VALUES
        (room.deal_room_id, match_data.buyer_id, 'Review Closing Disclosure', 'Carefully review final closing costs and loan terms (3 days before closing)', 'closing', 1, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Schedule Final Walkthrough', 'Inspect property one last time before closing', 'closing', 2, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Complete Final Walkthrough', 'Verify property condition and agreed repairs completed', 'closing', 3, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Wire Closing Funds', 'Wire remaining down payment and closing costs to title company', 'closing', 4, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Attend Closing/Sign Documents', 'Sign all closing documents and finalize purchase', 'closing', 5, 'todo'),
        (room.deal_room_id, match_data.buyer_id, 'Receive Keys', 'Get keys and celebrate your new home!', 'closing', 6, 'todo');

      -- CLOSING PHASE - Seller Tasks
      INSERT INTO tasks (deal_room_id, assignee_profile_id, title, description, category, order_index, status)
      VALUES
        (room.deal_room_id, match_data.seller_id, 'Complete Agreed Repairs', 'Finish all repairs agreed upon during negotiations', 'closing', 1, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Prepare for Final Walkthrough', 'Ensure property is clean and ready for buyer final walkthrough', 'closing', 2, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Move Out/Clean Property', 'Complete move-out and leave property broom-clean', 'closing', 3, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Attend Closing/Sign Documents', 'Sign all closing documents and transfer title', 'closing', 4, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Transfer Utilities', 'Coordinate utility transfers with buyer', 'closing', 5, 'todo'),
        (room.deal_room_id, match_data.seller_id, 'Hand Over Keys & Garage Openers', 'Provide all keys, garage openers, and manuals to buyer', 'closing', 6, 'todo');

      RAISE NOTICE 'Created % tasks for deal room %', 35, room.deal_room_id;
    END IF;
  END LOOP;
END;
$$;
