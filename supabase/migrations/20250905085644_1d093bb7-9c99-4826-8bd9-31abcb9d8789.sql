-- Add sample posts, assignments and notifications for testing
INSERT INTO posts (id, title, content, author_id, is_pinned, image_url) VALUES 
(gen_random_uuid(), 'Welcome to the New Academic Year!', 'We are excited to welcome all students, parents, and staff to the new academic year. This platform will help us stay connected and informed about all school activities.', 'system', true, null),
(gen_random_uuid(), 'Upcoming Parent-Teacher Conference', 'Parent-teacher conferences are scheduled for next week. Please check your calendar for your assigned time slot. We look forward to discussing your child''s progress.', 'system', false, null),
(gen_random_uuid(), 'Library Resources Now Available Online', 'Students can now access digital library resources from home. Check out our new online catalog and digital book collection through the school portal.', 'system', false, null);

INSERT INTO assignments (id, title, description, due_date, created_by) VALUES 
(gen_random_uuid(), 'Mathematics Homework - Chapter 5', 'Complete exercises 1-20 from Chapter 5. Show all work for full credit. Remember to check your answers using the methods we discussed in class.', NOW() + INTERVAL '3 days', 'system'),
(gen_random_uuid(), 'Science Project Proposal', 'Submit your science fair project proposal. Include hypothesis, methodology, and expected outcomes. Projects should demonstrate understanding of scientific method.', NOW() + INTERVAL '1 week', 'system'),
(gen_random_uuid(), 'History Essay: Industrial Revolution', 'Write a 500-word essay on the impact of the Industrial Revolution on modern society. Use at least 3 credible sources and cite them properly.', NOW() + INTERVAL '5 days', 'system');

INSERT INTO events (id, title, description, event_date, event_time, location, event_type, priority, created_by) VALUES 
(gen_random_uuid(), 'School Assembly', 'Monthly school assembly featuring student achievements and upcoming events announcements.', CURRENT_DATE + 2, '09:00:00', 'Main Auditorium', 'assembly', 'high', 'system'),
(gen_random_uuid(), 'Basketball Game vs. Riverside High', 'Home basketball game against Riverside High School. Come support our team!', CURRENT_DATE + 5, '18:00:00', 'School Gymnasium', 'sports', 'normal', 'system'),
(gen_random_uuid(), 'Science Fair Registration Deadline', 'Last day to register for the annual science fair. Submit your project proposals by 4 PM.', CURRENT_DATE + 7, '16:00:00', 'Science Department', 'academic', 'high', 'system');

INSERT INTO notifications (id, title, content, type, recipient_id) VALUES 
(gen_random_uuid(), 'New Assignment Posted', 'Mathematics Homework - Chapter 5 has been assigned. Due date: ' || TO_CHAR(NOW() + INTERVAL '3 days', 'Month DD, YYYY'), 'assignment', null),
(gen_random_uuid(), 'Upcoming Event Reminder', 'Don''t forget about the school assembly scheduled for ' || TO_CHAR(CURRENT_DATE + 2, 'Month DD, YYYY') || ' at 9:00 AM', 'event', null),
(gen_random_uuid(), 'New School Announcement', 'Welcome message has been posted by the administration. Check the announcements page for more details.', 'announcement', null);