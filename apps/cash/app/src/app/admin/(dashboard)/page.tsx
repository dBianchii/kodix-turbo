export default function DashboardPage() {
  return (
    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="font-medium text-sm tracking-tight">
                Total Cashback
              </h3>
            </div>
            <div className="font-bold text-2xl">R$ 0,00</div>
            <p className="text-muted-foreground text-xs">
              Seu cashback acumulado
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="font-medium text-sm tracking-tight">Compras</h3>
            </div>
            <div className="font-bold text-2xl">0</div>
            <p className="text-muted-foreground text-xs">
              Total de compras realizadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
