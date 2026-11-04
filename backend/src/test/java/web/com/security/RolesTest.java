package web.com.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests - Roles RBAC Permissions")
public class RolesTest {

    @Test
    @DisplayName("Chủ cửa hàng can assign any role except another Chủ cửa hàng")
    void testOwnerCanAssignRoles() {
        // Owner can assign manager, waiter, cashier, chef
        assertTrue(Roles.canAssign(Roles.CHU_CUA_HANG, Roles.QUAN_LY));
        assertTrue(Roles.canAssign(Roles.CHU_CUA_HANG, Roles.PHUC_VU));
        assertTrue(Roles.canAssign(Roles.CHU_CUA_HANG, Roles.THU_NGAN));
        assertTrue(Roles.canAssign(Roles.CHU_CUA_HANG, Roles.BEP));

        // Privilege escalation protection: No one can assign Owner role
        assertFalse(Roles.canAssign(Roles.CHU_CUA_HANG, Roles.CHU_CUA_HANG));
    }

    @Test
    @DisplayName("Quản lý can only assign operational roles, cannot assign Quản lý or Chủ")
    void testManagerRoleAssignmentLimits() {
        assertTrue(Roles.canAssign(Roles.QUAN_LY, Roles.PHUC_VU));
        assertTrue(Roles.canAssign(Roles.QUAN_LY, Roles.THU_NGAN));
        assertTrue(Roles.canAssign(Roles.QUAN_LY, Roles.BEP));

        assertFalse(Roles.canAssign(Roles.QUAN_LY, Roles.QUAN_LY));
        assertFalse(Roles.canAssign(Roles.QUAN_LY, Roles.CHU_CUA_HANG));
    }

    @Test
    @DisplayName("Operational staff cannot assign any roles")
    void testOperationalStaffCannotAssign() {
        assertFalse(Roles.canAssign(Roles.PHUC_VU, Roles.PHUC_VU));
        assertFalse(Roles.canAssign(Roles.THU_NGAN, Roles.THU_NGAN));
        assertFalse(Roles.canAssign(Roles.BEP, Roles.BEP));
        assertFalse(Roles.canAssign("UNKNOWN", Roles.PHUC_VU));
    }

    @Test
    @DisplayName("canManage checks: Owner can manage all except another Owner")
    void testOwnerCanManageAllStaffExceptOtherOwners() {
        assertTrue(Roles.canManage(Roles.CHU_CUA_HANG, Roles.QUAN_LY));
        assertTrue(Roles.canManage(Roles.CHU_CUA_HANG, Roles.PHUC_VU));
        assertTrue(Roles.canManage(Roles.CHU_CUA_HANG, Roles.THU_NGAN));
        assertTrue(Roles.canManage(Roles.CHU_CUA_HANG, Roles.BEP));

        assertFalse(Roles.canManage(Roles.CHU_CUA_HANG, Roles.CHU_CUA_HANG));
    }

    @Test
    @DisplayName("canManage checks: Manager cannot manage other Managers or Owner")
    void testManagerCannotManageManagersOrOwner() {
        assertFalse(Roles.canManage(Roles.QUAN_LY, Roles.CHU_CUA_HANG));
        assertFalse(Roles.canManage(Roles.QUAN_LY, Roles.QUAN_LY));

        assertTrue(Roles.canManage(Roles.QUAN_LY, Roles.PHUC_VU));
        assertTrue(Roles.canManage(Roles.QUAN_LY, Roles.THU_NGAN));
        assertTrue(Roles.canManage(Roles.QUAN_LY, Roles.BEP));
    }

    @Test
    @DisplayName("canManage checks: Regular staff cannot manage anyone")
    void testStaffCannotManageAnyone() {
        assertFalse(Roles.canManage(Roles.PHUC_VU, Roles.PHUC_VU));
        assertFalse(Roles.canManage(Roles.THU_NGAN, Roles.PHUC_VU));
        assertFalse(Roles.canManage(Roles.BEP, Roles.PHUC_VU));
    }
}

