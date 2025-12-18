"use client"

import { useContext, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { CurrencyDollar, Percent, PencilSimple, Plus, Trash } from "phosphor-react"
import SideNav from "../components/SideNav"
import { DiscountContext } from "../../context/DiscountContext"
import withAuth from "@/hoc/WithAuth"

function DiscountsPage() {
    const { discounts, isLoading, createDiscount, updateDiscount, deleteDiscount, toggleDiscount } = useContext(DiscountContext)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingDiscount, setEditingDiscount] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        value: 10,
        max_uses: '',
        min_order_amount: 0,
        max_discount_amount: '',
        expires_at: ''
    })

    const resetForm = () => {
        setFormData({
            code: '',
            discount_type: 'percentage',
            value: 10,
            max_uses: '',
            min_order_amount: 0,
            max_discount_amount: '',
            expires_at: ''
        })
        setEditingDiscount(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const data = {
            ...formData,
            max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
            max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
            expires_at: formData.expires_at || null
        }

        let result
        if (editingDiscount) {
            result = await updateDiscount(editingDiscount.id, data)
        } else {
            result = await createDiscount(data)
        }

        if (result.success) {
            setIsDialogOpen(false)
            resetForm()
        }
    }

    const handleEdit = (discount) => {
        setEditingDiscount(discount)
        setFormData({
            code: discount.code,
            discount_type: discount.discount_type,
            value: discount.value,
            max_uses: discount.max_uses?.toString() || '',
            min_order_amount: discount.min_order_amount,
            max_discount_amount: discount.max_discount_amount?.toString() || '',
            expires_at: discount.expires_at?.split('T')[0] || ''
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this discount?')) {
            await deleteDiscount(id)
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col pl-8">
            <SideNav />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 ml-14">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Discount Codes</h1>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open)
                        if (!open) resetForm()
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Discount
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingDiscount ? 'Edit Discount' : 'Create New Discount'}</DialogTitle>
                                    <DialogDescription>
                                        Create a discount code for your customers
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="code">Discount Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="SUMMER20"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            disabled={!!editingDiscount}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Discount Type</Label>
                                            <Select
                                                value={formData.discount_type}
                                                onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage</SelectItem>
                                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="value">
                                                {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount (KES)'}
                                            </Label>
                                            <Input
                                                id="value"
                                                type="number"
                                                min="0"
                                                max={formData.discount_type === 'percentage' ? 100 : undefined}
                                                value={formData.value}
                                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="max_uses">Max Uses (optional)</Label>
                                            <Input
                                                id="max_uses"
                                                type="number"
                                                min="1"
                                                placeholder="Unlimited"
                                                value={formData.max_uses}
                                                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="min_order">Min Order Amount</Label>
                                            <Input
                                                id="min_order"
                                                type="number"
                                                min="0"
                                                value={formData.min_order_amount}
                                                onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    {formData.discount_type === 'percentage' && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="max_discount">Max Discount Amount (optional)</Label>
                                            <Input
                                                id="max_discount"
                                                type="number"
                                                min="0"
                                                placeholder="No limit"
                                                value={formData.max_discount_amount}
                                                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="expires">Expiry Date (optional)</Label>
                                        <Input
                                            id="expires"
                                            type="date"
                                            value={formData.expires_at}
                                            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        {editingDiscount ? 'Save Changes' : 'Create Discount'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Discount Codes</CardTitle>
                        <CardDescription>Manage discount codes for your products</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-muted-foreground">Loading discounts...</p>
                        ) : discounts.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">No discount codes yet</p>
                                <Button onClick={() => setIsDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Discount
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Discount</TableHead>
                                        <TableHead>Uses</TableHead>
                                        <TableHead>Expires</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Active</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {discounts.map((discount) => (
                                        <TableRow key={discount.id}>
                                            <TableCell className="font-mono font-bold">{discount.code}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {discount.discount_type === 'percentage' ? (
                                                        <>
                                                            <Percent className="h-4 w-4" />
                                                            {discount.value}%
                                                        </>
                                                    ) : (
                                                        <>
                                                            KES {discount.value}
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {discount.current_uses} / {discount.max_uses || '∞'}
                                            </TableCell>
                                            <TableCell>
                                                {discount.expires_at
                                                    ? new Date(discount.expires_at).toLocaleDateString()
                                                    : 'Never'
                                                }
                                            </TableCell>
                                            <TableCell>
                                                {discount.is_valid ? (
                                                    <Badge variant="success" className="bg-green-100 text-green-800">Valid</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Expired</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={discount.is_active}
                                                    onCheckedChange={(checked) => toggleDiscount(discount.id, checked)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(discount)}>
                                                        <PencilSimple className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(discount.id)}>
                                                        <Trash className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

export default withAuth(DiscountsPage)
