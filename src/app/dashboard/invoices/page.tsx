"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";

type Client = {
  id: string;
  name: string;
};

type Invoice = {
  id: string;
  invoiceNum: string;
  client: Client;
  totalAmount: number;
  status: string;
  dueDate: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    invoiceNum: "",
    dueDate: "",
    status: "DRAFT",
    notes: "",
  });
  const [items, setItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const fetchData = async () => {
    const [invRes, cliRes] = await Promise.all([
      fetch("/api/invoices"),
      fetch("/api/clients"),
    ]);

    if (invRes.ok) setInvoices(await invRes.json());
    if (cliRes.ok) setClients(await cliRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, items }),
    });

    if (res.ok) {
      setOpen(false);
      setFormData({
        clientId: "",
        invoiceNum: "",
        dueDate: "",
        status: "DRAFT",
        notes: "",
      });
      setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button>Create Invoice</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(val) =>
                      setFormData({ ...formData, clientId: val as string })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNum">Invoice Number</Label>
                  <Input
                    id="invoiceNum"
                    required
                    value={formData.invoiceNum}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceNum: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) =>
                      setFormData({ ...formData, status: val as string })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="OVERDUE">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Line Items</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Description</Label>
                      <Input
                        required
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(index, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", parseInt(e.target.value))
                        }
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(index, "unitPrice", parseFloat(e.target.value))
                        }
                      />
                    </div>
                    <div className="w-32 pb-2 font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mb-0.5 text-red-500 hover:text-red-700"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end pt-4 border-t">
                  <div className="text-xl font-bold">
                    Total: ${calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Invoice</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNum}</TableCell>
                  <TableCell>{invoice.client.name}</TableCell>
                  <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        if (confirm("Are you sure?")) {
                          await fetch(`/api/invoices/${invoice.id}`, {
                            method: "DELETE",
                          });
                          fetchData();
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
