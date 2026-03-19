 'use client'

 import Link from 'next/link'
 import Navbar from '@/components/Navbar'
 import { Button } from '@/components/ui/button'

 export default function PreviewPage() {
   return (
     <div className="min-h-screen bg-background/95 landing-shell">
       <Navbar />
       <main className="pt-28 pb-10 px-6">
         <div className="mx-auto max-w-3xl rounded-2xl border border-muted/70 bg-card/80 p-8">
           <h1 className="text-2xl font-bold text-foreground">Preview</h1>
           <p className="mt-3 text-sm text-muted-foreground">
             Preview content is loading in this deployment-safe client component.
           </p>
           <div className="mt-6">
             <Button asChild>
               <Link href="/">Back to Home</Link>
             </Button>
           </div>
         </div>
       </main>
     </div>
   )
 }
