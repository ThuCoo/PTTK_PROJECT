-- Migration: Add checkout time tracking to room return process
-- This migration adds support for recording the actual checkout time
-- when a contract is finalized during the room return process

-- Check which naming convention is used and add column accordingly
DO $$
BEGIN
    -- Try snake_case table name first (used by backend DAOs)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hop_dong') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'hop_dong' AND column_name = 'ngay_tra_thuc_te'
        ) THEN
            ALTER TABLE hop_dong ADD COLUMN ngay_tra_thuc_te TIMESTAMP;
        END IF;
        
        -- Update constraint for trang_thai
        ALTER TABLE hop_dong DROP CONSTRAINT IF EXISTS hop_dong_trang_thai_check;
        ALTER TABLE hop_dong
        ADD CONSTRAINT hop_dong_trang_thai_check 
        CHECK (trang_thai IN ('Chờ ký', 'Đang hiệu lực', 'Đã kết thúc', 'Đã hủy', 'Đã thanh lý'));
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_hop_dong_trang_thai_thanh_ly 
        ON hop_dong(trang_thai) WHERE trang_thai = 'Đã thanh lý';
        
        CREATE INDEX IF NOT EXISTS idx_hop_dong_ngay_tra_thuc_te 
        ON hop_dong(ngay_tra_thuc_te);
    
    -- Fallback to PascalCase table name if exists
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'HopDong') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'HopDong' AND column_name = 'NgayTraThucTe'
        ) THEN
            ALTER TABLE "HopDong" ADD COLUMN "NgayTraThucTe" TIMESTAMP;
        END IF;
    END IF;
END $$;

