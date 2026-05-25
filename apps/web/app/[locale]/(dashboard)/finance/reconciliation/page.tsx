"use client";

import React, { useState, useEffect } from "react";
import { Button, Table, message, Card, Row, Col, Select } from "antd";
import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { 
    useGetBankAccountsQuery, 
    useGetBankTransactionsQuery, 
    useGetUnreconciledJournalsQuery,
    useReconcileTransactionMutation
} from "@/store/api/financeApi";
import { formatCurrency, formatDate } from "@/lib/utils";

const { Option } = Select;

export default function BankReconciliation() {
  const { data: bankAccounts } = useGetBankAccountsQuery();
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);
  
  const { data: bankTrx, isLoading: trxLoading } = useGetBankTransactionsQuery(
      selectedBankAccountId!, 
      { skip: !selectedBankAccountId }
  );
  const { data: journalLines, isLoading: journalsLoading } = useGetUnreconciledJournalsQuery(
      selectedBankAccountId!,
      { skip: !selectedBankAccountId }
  );
  
  const [reconcile] = useReconcileTransactionMutation();
  
  const [selectedBankTrxId, setSelectedBankTrxId] = useState<string | null>(null);
  const [selectedJournalLineId, setSelectedJournalLineId] = useState<string | null>(null);

  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0 && !selectedBankAccountId) {
      setSelectedBankAccountId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedBankAccountId]);

  const handleReconcile = async () => {
      if (!selectedBankTrxId || !selectedJournalLineId) return;
      
      try {
          // The API expects journalEntryId, but we might want to reconcile specific line.
          // Let's check the reconcileTransaction mutation in financeApi.
          // It says journalEntryId.
          const line = journalLines?.find(l => l.id === selectedJournalLineId);
          await reconcile({ 
              transactionId: selectedBankTrxId, 
              journalEntryId: line.journalEntryId 
          }).unwrap();
          
          message.success("Transaction reconciled successfully");
          setSelectedBankTrxId(null);
          setSelectedJournalLineId(null);
      } catch (err: any) {
          message.error(err.data?.message || "Failed to reconcile");
      }
  };

  const unreconciledBankTrx = bankTrx?.filter(t => t.status === "UNRECONCILED") || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Bank Reconciliation"
        subtitle="Match bank transactions with journal entries"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Reconciliation" },
        ]}
        extra={
            <Select
                value={selectedBankAccountId}
                onChange={setSelectedBankAccountId}
                style={{ width: 250 }}
                placeholder="Select Bank Account"
            >
                {bankAccounts?.map(acc => (
                    <Option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</Option>
                ))}
            </Select>
        }
      />

      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title={`Bank Transactions (${unreconciledBankTrx.length})`} 
            size="small"
            extra={<Button icon={<UploadOutlined />} size="small">Import</Button>}
          >
            <Table
              dataSource={unreconciledBankTrx}
              loading={trxLoading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              rowSelection={{
                  type: 'radio',
                  selectedRowKeys: selectedBankTrxId ? [selectedBankTrxId] : [],
                  onChange: (keys) => setSelectedBankTrxId(keys[0] as string)
              }}
              columns={[
                { title: "Date", dataIndex: "date", render: (d) => formatDate(d) },
                { title: "Description", dataIndex: "description", ellipsis: true },
                { title: "Amount", dataIndex: "amount", align: 'right', render: (val) => formatCurrency(val) },
              ]}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title={`Journal Entries (${journalLines?.length || 0})`} 
            size="small"
          >
            <Table
                dataSource={journalLines}
                loading={journalsLoading}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                rowSelection={{
                    type: 'radio',
                    selectedRowKeys: selectedJournalLineId ? [selectedJournalLineId] : [],
                    onChange: (keys) => setSelectedJournalLineId(keys[0] as string)
                }}
                columns={[
                    { title: "Date", dataIndex: ["journalEntry", "entryDate"], render: (d) => formatDate(d) },
                    { title: "Ref", dataIndex: ["journalEntry", "entryNumber"] },
                    { 
                        title: "Amount", 
                        align: 'right',
                        render: (_, record) => formatCurrency(Number(record.debit) - Number(record.credit)) 
                    },
                ]}
            />
          </Card>
        </Col>
      </Row>
      
      <div className="mt-6 flex justify-center">
          <Button 
            type="primary" 
            size="large" 
            icon={<CheckCircleOutlined />}
            disabled={!selectedBankTrxId || !selectedJournalLineId}
            onClick={handleReconcile}
          >
              Reconcile Selected
          </Button>
      </div>

      {!selectedBankTrxId && !selectedJournalLineId && (
          <div className="mt-4 bg-blue-50 p-4 rounded text-blue-700 text-center">
              <p>Select a bank transaction and a corresponding journal entry to reconcile them.</p>
          </div>
      )}
    </div>
  );
}
