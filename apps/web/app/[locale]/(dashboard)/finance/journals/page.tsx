"use client";

import { useState } from "react";
import { Table, Button, Modal, message, Tag, Space, Select, Input, DatePicker, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGetJournalsQuery, useCreateJournalMutation, useGetAccountsQuery } from "@/store/api/financeApi";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { journalEntrySchema } from "@repo/shared-schemas";
import dayjs from "dayjs";

export default function JournalEntries() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetJournalsQuery({ page, limit: 10 });
  const { data: accounts } = useGetAccountsQuery();
  const [createJournal] = useCreateJournalMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      entryDate: dayjs().toISOString(),
      description: "",
      reference: "",
      status: "DRAFT",
      lines: [
        { accountId: "", description: "", debit: 0, credit: 0 },
        { accountId: "", description: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = watch("lines");
  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleCreate = async (values: any) => {
    try {
      await createJournal(values).unwrap();
      message.success("Journal entry posted");
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to post journal entry");
    }
  };

  const columns = [
    { title: "Date", dataIndex: "entryDate", render: (date: string) => dayjs(date).format("YYYY-MM-DD") },
    { title: "Number", dataIndex: "entryNumber" },
    { title: "Description", dataIndex: "description" },
    { title: "Reference", dataIndex: "reference" },
    { title: "Total Debit", dataIndex: "totalDebit", render: (val: number) => `$${val.toFixed(2)}` },
    { title: "Total Credit", dataIndex: "totalCredit", render: (val: number) => `$${val.toFixed(2)}` },
    { 
      title: "Status", 
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "POSTED" ? "green" : "orange"}>{status}</Tag>
      )
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Journal Entries</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          New Journal Entry
        </Button>
      </div>

      <Table
        dataSource={data?.data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.meta?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <Modal
        title="New Journal Entry"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit(handleCreate)}
        width={1000}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Entry Date</label>
              <Controller
                name="entryDate"
                control={control}
                render={({ field }) => (
                  <DatePicker 
                    className="w-full" 
                    value={dayjs(field.value)} 
                    onChange={(date) => field.onChange(date?.toISOString())} 
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reference</label>
              <Controller
                name="reference"
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Account</th>
                <th className="py-2">Description</th>
                <th className="py-2">Debit</th>
                <th className="py-2">Credit</th>
                <th className="py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id} className="border-b">
                  <td className="py-2 pr-2">
                    <Controller
                      name={`lines.${index}.accountId`}
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          className="w-full"
                          showSearch
                          options={accounts?.map(a => ({ label: `${a.code} - ${a.name}`, value: a.id }))}
                        />
                      )}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Controller
                      name={`lines.${index}.description`}
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Controller
                      name={`lines.${index}.debit`}
                      control={control}
                      render={({ field }) => <InputNumber {...field} className="w-full" min={0} precision={2} />}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Controller
                      name={`lines.${index}.credit`}
                      control={control}
                      render={({ field }) => <InputNumber {...field} className="w-full" min={0} precision={2} />}
                    />
                  </td>
                  <td className="py-2">
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => remove(index)} 
                      disabled={fields.length <= 2}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Button type="dashed" onClick={() => append({ accountId: "", description: "", debit: 0, credit: 0 })} block icon={<PlusOutlined />}>
            Add Line
          </Button>

          <div className="flex justify-end space-x-8 text-lg font-semibold p-4 bg-gray-50 rounded">
            <div className={isBalanced ? "text-green-600" : "text-red-600"}>
              Total Debit: ${totalDebit.toFixed(2)}
            </div>
            <div className={isBalanced ? "text-green-600" : "text-red-600"}>
              Total Credit: ${totalCredit.toFixed(2)}
            </div>
            {!isBalanced && (
              <div className="text-red-600 ml-4">
                Out of Balance: ${Math.abs(totalDebit - totalCredit).toFixed(2)}
              </div>
            )}
          </div>
          {errors.lines?.root && (
            <p className="text-red-500 text-sm">{errors.lines.root.message}</p>
          )}
          {errors && Object.keys(errors).length > 0 && !errors.lines?.root && (
             <p className="text-red-500 text-sm">Please check the form for errors. {errors.root?.message}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
