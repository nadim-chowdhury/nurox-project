"use client";

import { Upload, Button, Table, message, Card } from "antd";
import { UploadOutlined, SwapOutlined } from "@ant-design/icons";

export default function BankReconciliation() {
  
  const handleUpload = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bank Reconciliation</h2>
        <Upload
          name="file"
          action="/api/finance/banking/import"
          onChange={handleUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>Import Bank Statement (CSV/OFX)</Button>
        </Upload>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Bank Transactions (Unreconciled)" size="small">
          <Table
            dataSource={[]} // Mock data
            pagination={false}
            columns={[
              { title: "Date", dataIndex: "date" },
              { title: "Description", dataIndex: "description" },
              { title: "Amount", dataIndex: "amount", render: (val) => `$${val}` },
              { title: "Action", render: () => <Button size="small" icon={<SwapOutlined />}>Match</Button> }
            ]}
          />
        </Card>
        <Card title="System Journal Entries" size="small">
            <Table
                dataSource={[]} // Mock data
                pagination={false}
                columns={[
                    { title: "Date", dataIndex: "date" },
                    { title: "Ref", dataIndex: "ref" },
                    { title: "Amount", dataIndex: "amount" },
                    { title: "Action", render: () => <Button size="small">Select</Button> }
                ]}
            />
        </Card>
      </div>
      
      <div className="bg-blue-50 p-4 rounded text-blue-700">
          <p>Select a transaction from the left and match it with a journal entry on the right to reconcile.</p>
      </div>
    </div>
  );
}
