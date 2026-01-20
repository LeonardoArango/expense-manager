import { ExcelImporter } from "@/components/shared/ExcelImporter"
import { importCategories, importTransactions } from "./import-actions"
import { ManageCategoriesDialog } from "@/components/finance/manage-categories-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Separator />

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                        <CardDescription>Manage your income and expense categories and subcategories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ManageCategoriesDialog />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Import Categories</CardTitle>
                        <CardDescription>
                            Bulk upload categories from Excel.
                            <br />Headers: <code>Categoría Principal</code>, <code>Subcategoría</code>, <code>Tipo</code>, <code>Nota</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExcelImporter
                            onImport={importCategories}
                            buttonLabel="Upload Categories Excel"
                            templateHeaders={['Categoría Principal', 'Subcategoría', 'Tipo']}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Import Transactions</CardTitle>
                        <CardDescription>
                            Bulk upload transactions.
                            <br />Headers: <code>Fecha</code>, <code>Descripción</code>, <code>Monto</code>, <code>Tipo</code>, <code>Cuenta</code>, etc.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExcelImporter
                            onImport={importTransactions}
                            buttonLabel="Upload Transactions Excel"
                            templateHeaders={['Fecha', 'Descripción', 'Monto', 'Cuenta', 'Categoría']}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
