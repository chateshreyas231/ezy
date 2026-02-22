import { MoveDownLeft, MoveUpRight } from "lucide-react";

function Stats() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="flex flex-col justify-between gap-0 rounded-md border p-6">
            <MoveUpRight className="mb-10 h-4 w-4 text-primary" />
            <h2 className="flex max-w-xl flex-row items-end gap-4 text-left text-4xl tracking-tighter">
              500.000
              <span className="text-sm tracking-normal text-muted-foreground">+20.1%</span>
            </h2>
            <p className="max-w-xl text-left text-base leading-relaxed tracking-tight text-muted-foreground">
              Monthly active users
            </p>
          </div>
          <div className="flex flex-col justify-between gap-0 rounded-md border p-6">
            <MoveDownLeft className="mb-10 h-4 w-4 text-destructive" />
            <h2 className="flex max-w-xl flex-row items-end gap-4 text-left text-4xl tracking-tighter">
              20.105
              <span className="text-sm tracking-normal text-muted-foreground">-2%</span>
            </h2>
            <p className="max-w-xl text-left text-base leading-relaxed tracking-tight text-muted-foreground">
              Daily active users
            </p>
          </div>
          <div className="flex flex-col justify-between gap-0 rounded-md border p-6">
            <MoveUpRight className="mb-10 h-4 w-4 text-emerald-500" />
            <h2 className="flex max-w-xl flex-row items-end gap-4 text-left text-4xl tracking-tighter">
              $523.520
              <span className="text-sm tracking-normal text-muted-foreground">+8%</span>
            </h2>
            <p className="max-w-xl text-left text-base leading-relaxed tracking-tight text-muted-foreground">
              Monthly recurring revenue
            </p>
          </div>
          <div className="flex flex-col justify-between gap-0 rounded-md border p-6">
            <MoveUpRight className="mb-10 h-4 w-4 text-primary" />
            <h2 className="flex max-w-xl flex-row items-end gap-4 text-left text-4xl tracking-tighter">
              $1052
              <span className="text-sm tracking-normal text-muted-foreground">+2%</span>
            </h2>
            <p className="max-w-xl text-left text-base leading-relaxed tracking-tight text-muted-foreground">
              Cost per acquisition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Stats };
