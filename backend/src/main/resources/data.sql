-- Demo data for Ega Bank
-- Inserts 10 clients, 10 accounts and 10 transactions

-- CLIENTS
INSERT INTO clients (id, first_name, last_name, birth_date, gender, address, phone_number, email, nationality) VALUES
(1, 'Client1', 'Demo1', '1985-02-10', 'FEMALE', 'Demo Address 1', '+223700000001', 'client1@example.com', 'DemoLand'),
(2, 'Client2', 'Demo2', '1978-05-14', 'MALE', 'Demo Address 2', '+223700000002', 'client2@example.com', 'DemoLand'),
(3, 'Client3', 'Demo3', '1990-08-21', 'FEMALE', 'Demo Address 3', '+223700000003', 'client3@example.com', 'DemoLand'),
(4, 'Client4', 'Demo4', '1982-11-03', 'MALE', 'Demo Address 4', '+223700000004', 'client4@example.com', 'DemoLand'),
(5, 'Client5', 'Demo5', '1995-01-17', 'FEMALE', 'Demo Address 5', '+223700000005', 'client5@example.com', 'DemoLand'),
(6, 'Client6', 'Demo6', '1988-07-09', 'MALE', 'Demo Address 6', '+223700000006', 'client6@example.com', 'DemoLand'),
(7, 'Client7', 'Demo7', '1992-03-29', 'FEMALE', 'Demo Address 7', '+223700000007', 'client7@example.com', 'DemoLand'),
(8, 'Client8', 'Demo8', '1987-12-12', 'MALE', 'Demo Address 8', '+223700000008', 'client8@example.com', 'DemoLand'),
(9, 'Client9', 'Demo9', '1999-06-06', 'FEMALE', 'Demo Address 9', '+223700000009', 'client9@example.com', 'DemoLand'),
(10, 'Client10', 'Demo10', '1983-09-19', 'MALE', 'Demo Address 10', '+223700000010', 'client10@example.com', 'DemoLand');

-- ACCOUNTS
INSERT INTO accounts (id, account_number, type, created_at, balance, owner_id) VALUES
(1, 'EGABANK0001', 'SAVINGS', '2026-01-10 09:00:00', 2500.00, 1),
(2, 'EGABANK0002', 'CURRENT', '2026-02-12 10:30:00', 4300.50, 2),
(3, 'EGABANK0003', 'SAVINGS', '2026-03-05 11:15:00', 1200.75, 3),
(4, 'EGABANK0004', 'CURRENT', '2026-01-20 14:40:00', 980.00, 4),
(5, 'EGABANK0005', 'SAVINGS', '2026-04-01 08:20:00', 7600.00, 5),
(6, 'EGABANK0006', 'CURRENT', '2026-02-28 16:05:00', 305.25, 6),
(7, 'EGABANK0007', 'SAVINGS', '2026-03-15 12:00:00', 15000.00, 7),
(8, 'EGABANK0008', 'CURRENT', '2026-01-30 09:45:00', 640.00, 8),
(9, 'EGABANK0009', 'SAVINGS', '2026-04-20 13:10:00', 2200.00, 9),
(10, 'EGABANK0010', 'CURRENT', '2026-05-01 15:25:00', 510.10, 10);

-- TRANSACTIONS
INSERT INTO transactions (id, type, amount, transaction_date, description, related_account_number, account_id) VALUES
(1, 'DEPOSIT', 2500.00, '2026-01-10 09:05:00', 'Initial deposit', NULL, 1),
(2, 'DEPOSIT', 4300.50, '2026-02-12 10:35:00', 'Initial deposit', NULL, 2),
(3, 'DEPOSIT', 1200.75, '2026-03-05 11:20:00', 'Initial deposit', NULL, 3),
(4, 'DEPOSIT', 980.00, '2026-01-20 14:45:00', 'Initial deposit', NULL, 4),
(5, 'DEPOSIT', 7600.00, '2026-04-01 08:25:00', 'Initial deposit', NULL, 5),
(6, 'DEPOSIT', 305.25, '2026-02-28 16:10:00', 'Initial deposit', NULL, 6),
(7, 'DEPOSIT', 15000.00, '2026-03-15 12:05:00', 'Initial deposit', NULL, 7),
(8, 'DEPOSIT', 640.00, '2026-01-30 09:50:00', 'Initial deposit', NULL, 8),
(9, 'DEPOSIT', 2200.00, '2026-04-20 13:15:00', 'Initial deposit', NULL, 9),
(10, 'DEPOSIT', 510.10, '2026-05-01 15:30:00', 'Initial deposit', NULL, 10);

-- Note: If your tables use different column names or naming strategy, adjust the SQL accordingly.
