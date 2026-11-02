package web.com.security;

public final class Roles {
    private Roles() {}

    public static final String CHU_CUA_HANG = "Chủ cửa hàng";
    public static final String QUAN_LY      = "Quản lý";
    public static final String PHUC_VU      = "Phục vụ";
    public static final String THU_NGAN     = "Thu ngân";
    public static final String BEP          = "Bếp";

    /**
     * actor có được gán role target cho người khác không?
     * Chỉ Chủ mới được gán Quản lý.
     * Không ai được gán Chủ (bảo vệ leo thang đặc quyền).
     */
    public static boolean canAssign(String actorRole, String targetRole) {
        if (CHU_CUA_HANG.equals(targetRole)) return false;
        if (CHU_CUA_HANG.equals(actorRole))  return true;
        return QUAN_LY.equals(actorRole) &&
               (PHUC_VU.equals(targetRole) || THU_NGAN.equals(targetRole) || BEP.equals(targetRole));
    }

    /**
     * actor có được sửa/xóa target không?
     * Không ai được chạm vào Chủ. Quản lý không được sửa Quản lý khác.
     */
    public static boolean canManage(String actorRole, String targetRole) {
        if (CHU_CUA_HANG.equals(targetRole))  return false;
        if (CHU_CUA_HANG.equals(actorRole))   return true;
        if (QUAN_LY.equals(targetRole))        return false;
        return QUAN_LY.equals(actorRole);
    }
}

