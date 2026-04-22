"use client";

import React, { useState } from "react";
import {
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Upload,
  Divider,
  Switch,
  message,
  Space,
  Modal,
  Checkbox,
} from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  BellOutlined,
  LockOutlined,
  GlobalOutlined,
  TeamOutlined,
  ApiOutlined,
  MonitorOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import { confirmModal } from "@/components/common/ConfirmModal";
import { StatusTag } from "@/components/common/StatusTag";
import { useAppSelector } from "@/hooks/useRedux";
import {
  useGetUsersQuery,
  useInviteUserMutation,
  useDeleteUserMutation,
  useLazyGetAvatarUploadUrlQuery,
  useUpdateUserMutation,
} from "@/store/api/usersApi";
import {
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useSetup2FAMutation,
  useEnable2FAMutation,
  useChangePasswordMutation,
} from "@/store/api/authApi";
import {
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
} from "@/store/api/systemApi";
import { BulkUserImport } from "@/components/modules/system/BulkUserImport";
import { Permission } from "@repo/shared-schemas";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const labelStyle = { color: "var(--color-on-surface-variant)", fontSize: 13 };
const cardStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--ghost-border)",
  borderRadius: 4,
};

function ProfileTab() {
  const user = useAppSelector((s) => s.auth.user);
  const [updateUser] = useUpdateUserMutation();
  const [getUploadUrl] = useLazyGetAvatarUploadUrlQuery();

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const { uploadUrl, key } = await getUploadUrl(file.type).unwrap();
      
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (response.ok) {
        const avatarUrl = `${process.env.NEXT_PUBLIC_S3_PUBLIC_URL || 'http://localhost:9000/nurox-erp'}/${key}`;
        await updateUser({ id: user!.id, data: { avatarUrl } }).unwrap();
        message.success("Avatar updated");
        onSuccess("ok");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      message.error("Failed to upload avatar");
      onError(err);
    }
  };

  const onFinish = async (values: any) => {
    try {
      await updateUser({ id: user!.id, data: values }).unwrap();
      message.success("Profile updated");
    } catch {
      message.error("Failed to update profile");
    }
  };

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <Avatar
          name={`${user?.firstName || "N"} ${user?.lastName || "U"}`}
          src={user?.avatarUrl || undefined}
          size={72}
        />
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              margin: 0,
            }}
          >
            {user?.firstName} {user?.lastName}
          </h3>
          <p
            style={{
              color: "var(--color-on-surface-variant)",
              fontSize: 13,
              margin: "4px 0 12px",
            }}
          >
            {user?.email}
          </p>
          <Upload customRequest={handleUpload} showUploadList={false}>
            <Button icon={<UploadOutlined />} size="small">
              Change Photo
            </Button>
          </Upload>
        </div>
      </div>
      <Form
        layout="vertical"
        requiredMark={false}
        size="large"
        onFinish={onFinish}
        initialValues={{
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          phone: user?.phone,
        }}
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="firstName"
              label={<span style={labelStyle}>First Name</span>}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="lastName"
              label={<span style={labelStyle}>Last Name</span>}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label={<span style={labelStyle}>Email</span>}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label={<span style={labelStyle}>Phone</span>}
            >
              <Input placeholder="+1 (555) 000-0000" />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          htmlType="submit"
        >
          Save Changes
        </Button>
      </Form>
    </Card>
  );
}

function CompanyTab() {
  const { data: profile, isLoading } = useGetCompanyProfileQuery();
  const [updateProfile] = useUpdateCompanyProfileMutation();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      await updateProfile(values).unwrap();
      message.success("Company settings saved");
    } catch {
      message.error("Failed to save company settings");
    }
  };

  if (isLoading) return <Card style={cardStyle} loading />;

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        size="large"
        onFinish={onFinish}
        initialValues={profile}
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label={<span style={labelStyle}>Company Name</span>}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="taxRegistrationNumber"
              label={<span style={labelStyle}>Tax Registration (TRN/TIN)</span>}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="website"
              label={<span style={labelStyle}>Website</span>}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label={<span style={labelStyle}>Business Email</span>}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              name="address"
              label={<span style={labelStyle}>Headquarters Address</span>}
            >
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          htmlType="submit"
        >
          Save
        </Button>
      </Form>
    </Card>
  );
}

function BranchesTab() {
  const { data: branches, isLoading, refetch } = useGetBranchesQuery();
  const [createBranch] = useCreateBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingBranch(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (branch: any) => {
    setEditingBranch(branch);
    form.setFieldsValue(branch);
    setIsModalOpen(true);
  };

  const onFinish = async (values: any) => {
    try {
      if (editingBranch) {
        await updateBranch({ id: editingBranch.id, data: values }).unwrap();
        message.success("Branch updated");
      } else {
        await createBranch(values).unwrap();
        message.success("Branch created");
      }
      setIsModalOpen(false);
      refetch();
    } catch {
      message.error("Failed to save branch");
    }
  };

  const handleDelete = (id: string, name: string) => {
    confirmModal({
      title: `Delete Branch: ${name}?`,
      content: "This action cannot be undone.",
      onOk: async () => {
        try {
          await deleteBranch(id).unwrap();
          message.success("Branch deleted");
          refetch();
        } catch {
          message.error("Failed to delete branch");
        }
      },
    });
  };

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            margin: 0,
          }}
        >
          Branches
        </h3>
        <Button type="primary" size="small" onClick={handleAdd}>
          Add Branch
        </Button>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
      ) : (
        branches?.map((branch) => (
          <div
            key={branch.id}
            style={{
              padding: "16px 0",
              borderBottom: "1px solid var(--ghost-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 500, color: "var(--color-on-surface)" }}>
                {branch.name} ({branch.code})
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-on-surface-variant)",
                }}
              >
                {branch.address || "No address"} • {branch.timezone}
              </div>
            </div>
            <Space>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(branch)} />
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(branch.id!, branch.name)}
              />
            </Space>
          </div>
        ))
      )}

      <Modal
        title={editingBranch ? "Edit Branch" : "Add Branch"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="name" label="Branch Name" rules={[{ required: true }]}>
                <Input placeholder="Main Office" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="code" label="Code" rules={[{ required: true }]}>
                <Input placeholder="HQ" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="timezone" label="Timezone" initialValue="UTC">
            <Select options={[{ value: 'UTC', label: 'UTC' }, { value: 'EST', label: 'Eastern' }]} />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

function UsersTab() {
  const {
    data: users,
    isLoading,
    refetch,
  } = useGetUsersQuery({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const { data: roles } = useGetRolesQuery();
  const [inviteUser] = useInviteUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [form] = Form.useForm();

  const handleInvite = async (values: any) => {
    try {
      await inviteUser(values).unwrap();
      message.success("Invitation sent successfully");
      setIsModalOpen(false);
      refetch();
    } catch {
      message.error("Failed to send invitation");
    }
  };

  const handleDelete = (id: string, name: string) => {
    confirmModal({
      title: `Delete User: ${name}?`,
      content:
        "This will permanently disable their login. This action cannot be undone.",
      onOk: async () => {
        try {
          await deleteUser(id).unwrap();
          message.success("User deleted");
          refetch();
        } catch {
          message.error("Failed to delete user");
        }
      },
    });
  };

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            margin: 0,
          }}
        >
          Users & Invites
        </h3>
        <Space>
          <Button icon={<FileTextOutlined />} onClick={() => setIsBulkImportOpen(true)}>
            Bulk Import
          </Button>
          <Button type="primary" icon={<UserAddOutlined />} size="small" onClick={() => setIsModalOpen(true)}>
            Invite User
          </Button>
        </Space>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
      ) : (
        users?.data?.map((user) => (
          <div
            key={user.id}
            style={{
              padding: "16px 0",
              borderBottom: "1px solid var(--ghost-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatarUrl || undefined} size={36} />
              <div>
                <div
                  style={{ fontWeight: 500, color: "var(--color-on-surface)" }}
                >
                  {user.firstName} {user.lastName}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  {user.email} • {user.role}
                </div>
              </div>
            </div>
            <Space>
              <StatusTag status={user.status} />
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() =>
                  handleDelete(user.id, `${user.firstName} ${user.lastName}`)
                }
              />
            </Space>
          </div>
        ))
      )}

      <Modal
        title="Invite New User"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleInvite}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="john.doe@company.com" />
          </Form.Item>
          <Form.Item name="role" label="Assign Role" rules={[{ required: true }]}>
            <Select options={roles?.map(r => ({ label: r.name, value: r.name }))} />
          </Form.Item>
        </Form>
      </Modal>

      <BulkUserImport 
        open={isBulkImportOpen} 
        onClose={() => setIsBulkImportOpen(false)} 
        onSuccess={refetch} 
      />
    </Card>
  );
}

function SecurityTab() {
  const user = useAppSelector((s) => s.auth.user);
  const [setup2FA] = useSetup2FAMutation();
  const [enable2FA] = useEnable2FAMutation();
  const [changePassword] = useChangePasswordMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [qrData, setQrData] = useState<{ qrCodeDataURL: string; secret: string } | null>(null);
  const [token, setToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [form] = Form.useForm();

  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      try {
        const resp = await setup2FA().unwrap();
        setQrData(resp);
        setIsModalOpen(true);
      } catch {
        message.error("Failed to initiate 2FA setup");
      }
    } else {
      message.info("Disabling 2FA is currently administrative only");
    }
  };

  const handleVerify = async () => {
    if (!token) return;
    setIsVerifying(true);
    try {
      const resp = await enable2FA({ token }).unwrap();
      setBackupCodes(resp.backupCodes);
      message.success("2FA enabled successfully");
    } catch {
      message.error("Invalid verification token");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      await changePassword({
        currentPassword: values.current,
        newPassword: values.newPassword,
      }).unwrap();
      message.success("Password updated successfully");
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to update password");
    }
  };

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 24,
        }}
      >
        Change Password
      </h3>
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        size="large"
        style={{ maxWidth: 400 }}
        onFinish={handlePasswordChange}
      >
        <Form.Item
          name="current"
          label={<span style={labelStyle}>Current Password</span>}
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label={<span style={labelStyle}>New Password</span>}
          rules={[{ required: true, min: 8 }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirm"
          label={<span style={labelStyle}>Confirm Password</span>}
          dependencies={['newPassword']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Button
          type="primary"
          icon={<LockOutlined />}
          htmlType="submit"
        >
          Update Password
        </Button>
      </Form>
      <Divider />
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 16,
        }}
      >
        Two-Factor Authentication
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Switch 
          checked={user?.isTwoFactorEnabled} 
          onChange={handleToggle2FA} 
          disabled={user?.isTwoFactorEnabled}
        />
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {user?.isTwoFactorEnabled ? "2FA is active" : "Enable 2FA for login"}
        </span>
      </div>

      <Modal
        title="Setup Two-Factor Authentication"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {backupCodes ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-success)', fontWeight: 600, marginBottom: 16 }}>
              2FA Enabled Successfully!
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>
              Please save these backup codes in a safe place. Each code can be used once if you lose access to your authenticator app.
            </p>
            <div style={{ 
              background: 'var(--color-surface-container-high)', 
              padding: 16, 
              borderRadius: 4, 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              fontFamily: 'monospace',
              marginBottom: 24
            }}>
              {backupCodes.map(code => <div key={code}>{code}</div>)}
            </div>
            <Button type="primary" block onClick={() => setIsModalOpen(false)}>Done</Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            {qrData && (
              <img 
                src={qrData.qrCodeDataURL} 
                alt="2FA QR Code" 
                style={{ width: 200, height: 200, marginBottom: 24, border: '4px solid white' }} 
              />
            )}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Or enter this secret manually:</p>
              <code style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600 }}>{qrData?.secret}</code>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Input 
                placeholder="6-digit token" 
                value={token} 
                onChange={e => setToken(e.target.value)} 
                maxLength={6}
              />
              <Button type="primary" loading={isVerifying} onClick={handleVerify}>Verify</Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}

function SessionsTab() {
  const { data: sessions, isLoading, refetch } = useGetSessionsQuery();
  const [revoke] = useRevokeSessionMutation();

  const handleRevoke = async (id: string) => {
    try {
      await revoke(id).unwrap();
      message.success("Session revoked");
      refetch();
    } catch {
      message.error("Failed to revoke session");
    }
  };

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 24,
        }}
      >
        Active Sessions
      </h3>
      <p
        style={{
          color: "var(--color-on-surface-variant)",
          fontSize: 13,
          marginBottom: 24,
        }}
      >
        These are the devices that are currently logged into your account. You
        can revoke any session to log out from that device.
      </p>

      {isLoading ? (
        <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
      ) : (
        sessions?.map((session) => (
          <div
            key={session.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: "1px solid var(--ghost-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: "var(--ghost-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: "var(--color-primary)",
                }}
              >
                <MonitorOutlined />
              </div>
              <div>
                <div
                  style={{
                    color: "var(--color-on-surface)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {session.userAgent || "Unknown Device"}{" "}
                  {session.isCurrent && (
                    <span
                      style={{
                        background: "var(--color-primary)",
                        color: "white",
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 10,
                        marginLeft: 8,
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 12,
                  }}
                >
                  {session.ipAddress} • Last active{" "}
                  {dayjs(session.lastActiveAt).fromNow()}
                </div>
              </div>
            </div>
            {!session.isCurrent && (
              <Button
                type="text"
                danger
                size="small"
                onClick={() => handleRevoke(session.id)}
              >
                Revoke
              </Button>
            )}
          </div>
        ))
      )}
    </Card>
  );
}

function RolesTab() {
  const { data: roles, isLoading, refetch } = useGetRolesQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createRole(values).unwrap();
      message.success("Role created successfully");
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch {
      message.error("Failed to create role");
    }
  };

  const permissionGroups = [
    {
      title: "Human Resources",
      permissions: [
        { label: "View Employees", value: Permission.HR_VIEW_EMPLOYEES },
        { label: "Create Employee", value: Permission.HR_CREATE_EMPLOYEE },
        { label: "Update Employee", value: Permission.HR_UPDATE_EMPLOYEE },
        { label: "Delete Employee", value: Permission.HR_DELETE_EMPLOYEE },
        { label: "Manage Performance", value: Permission.HR_MANAGE_PERFORMANCE },
      ],
    },
    {
      title: "Finance",
      permissions: [
        { label: "View Invoices", value: Permission.FINANCE_VIEW_INVOICES },
        { label: "Manage Invoices", value: Permission.FINANCE_MANAGE_INVOICES },
        { label: "View Accounts", value: Permission.FINANCE_VIEW_ACCOUNTS },
        { label: "Manage Accounts", value: Permission.FINANCE_MANAGE_ACCOUNTS },
      ],
    },
    {
      title: "Sales",
      permissions: [
        { label: "View Deals", value: Permission.SALES_VIEW_DEALS },
        { label: "Manage Deals", value: Permission.SALES_MANAGE_DEALS },
        { label: "View Leads", value: Permission.SALES_VIEW_LEADS },
        { label: "Manage Leads", value: Permission.SALES_MANAGE_LEADS },
      ],
    },
    {
        title: "System",
        permissions: [
            { label: "Admin Access", value: Permission.SYSTEM_ADMIN_ACCESS },
        ]
    }
  ];

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            margin: 0,
          }}
        >
          Roles & Permissions
        </h3>
        <Button type="primary" size="small" onClick={() => setIsModalOpen(true)}>
          Create Role
        </Button>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
      ) : (
        roles?.map((role) => (
          <div
            key={role.id}
            style={{
              padding: "16px 0",
              borderBottom: "1px solid var(--ghost-border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{ fontWeight: 500, color: "var(--color-on-surface)" }}
              >
                {role.name}
              </div>
              {role.isSystem && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  System Role
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-on-surface-variant)",
                marginTop: 4,
              }}
            >
              {role.description || "No description"}
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              {role.permissions.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: 10,
                    background: "var(--ghost-bg)",
                    color: "var(--color-on-surface-variant)",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))
      )}

      <Modal
        title="Create Custom Role"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="Role Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Senior Recruiter" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Divider orientation="left">Permissions</Divider>
          <Form.Item name="permissions" rules={[{ required: true, message: 'Please select at least one permission' }]}>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              <Checkbox.Group style={{ width: '100%' }}>
                {permissionGroups.map(group => (
                  <div key={group.title} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8, color: 'var(--color-primary)' }}>
                      {group.title.toUpperCase()}
                    </div>
                    <Row>
                      {group.permissions.map(p => (
                        <Col span={12} key={p.value} style={{ marginBottom: 4 }}>
                          <Checkbox value={p.value}>{p.label}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ))}
              </Checkbox.Group>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

function NotificationsTab() {
  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 24,
        }}
      >
        Notification Preferences
      </h3>
      {[
        {
          label: "Email notifications for leave approvals",
          defaultChecked: true,
        },
        { label: "Push notifications for new tasks", defaultChecked: true },
        { label: "Weekly summary reports", defaultChecked: false },
        { label: "Invoice payment reminders", defaultChecked: true },
        { label: "Inventory low stock alerts", defaultChecked: true },
        { label: "Payroll run completion", defaultChecked: true },
        { label: "New employee onboarding", defaultChecked: false },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: "1px solid var(--ghost-border)",
          }}
        >
          <span style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
            {item.label}
          </span>
          <Switch defaultChecked={item.defaultChecked} />
        </div>
      ))}
      <Button
        type="primary"
        icon={<SaveOutlined />}
        style={{ marginTop: 24 }}
        onClick={() => message.success("Preferences saved")}
      >
        Save Preferences
      </Button>
    </Card>
  );
}

function IntegrationsTab() {
  const integrations = [
    {
      name: "Slack",
      description: "Get notifications in Slack channels",
      connected: true,
    },
    {
      name: "Google Calendar",
      description: "Sync leave & attendance with calendar",
      connected: true,
    },
    {
      name: "QuickBooks",
      description: "Export financial data to QuickBooks",
      connected: false,
    },
    {
      name: "Stripe",
      description: "Process invoice payments online",
      connected: false,
    },
    {
      name: "Jira",
      description: "Sync project tasks with Jira",
      connected: false,
    },
  ];
  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 24,
        }}
      >
        Connected Services
      </h3>
      {integrations.map((item) => (
        <div
          key={item.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 0",
            borderBottom: "1px solid var(--ghost-border)",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--color-on-surface)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {item.name}
            </div>
            <div
              style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
            >
              {item.description}
            </div>
          </div>
          <Button
            type={item.connected ? "default" : "primary"}
            size="small"
            danger={item.connected}
          >
            {item.connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      ))}
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and system preferences"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <Tabs
        tabPosition="left"
        style={{ minHeight: 500 }}
        items={[
          {
            key: "profile",
            label: (
              <span>
                <UserOutlined /> Profile
              </span>
            ),
            children: <ProfileTab />,
          },
          {
            key: "company",
            label: (
              <span>
                <GlobalOutlined /> Company
              </span>
            ),
            children: <CompanyTab />,
          },
          {
            key: "branches",
            label: (
              <span>
                <EnvironmentOutlined /> Branches
              </span>
            ),
            children: <BranchesTab />,
          },
          {
            key: "users",
            label: (
              <span>
                <UserAddOutlined /> Users
              </span>
            ),
            children: <UsersTab />,
          },
          {
            key: "security",
            label: (
              <span>
                <LockOutlined /> Security
              </span>
            ),
            children: <SecurityTab />,
          },
          {
            key: "sessions",
            label: (
              <span>
                <MonitorOutlined /> Sessions
              </span>
            ),
            children: <SessionsTab />,
          },
          {
            key: "roles",
            label: (
              <span>
                <TeamOutlined /> Roles
              </span>
            ),
            children: <RolesTab />,
          },
          {
            key: "notifications",
            label: (
              <span>
                <BellOutlined /> Notifications
              </span>
            ),
            children: <NotificationsTab />,
          },
          {
            key: "integrations",
            label: (
              <span>
                <ApiOutlined /> Integrations
              </span>
            ),
            children: <IntegrationsTab />,
          },
        ]}
      />
    </div>
  );
}
