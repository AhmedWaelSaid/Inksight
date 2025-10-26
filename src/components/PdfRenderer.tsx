"use client";

import { AlertCircle, ChevronDown, ChevronUp, Loader, RotateCw, Search } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizeDetector } from "react-resize-detector";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import SimpleBar from 'simplebar-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import PdfFullscreen from "./PdfFullscreen";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface Iprops {
  url: string;
}

const PdfRenderer = ({ url }: Iprops) => {
  const [pagesNumbers, setpagesNumbers] = useState<number>();
  const [currentPage, setcurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [Rotation, setRotation] = useState<number>(0);
  
  const Custompagenumvaildator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= pagesNumbers!),
  });
  type TCustompagenumvaildator = z.infer<typeof Custompagenumvaildator>;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustompagenumvaildator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(Custompagenumvaildator),
  });
  const handlePageSubmit = ({ page }: TCustompagenumvaildator) => {
    setcurrentPage(Number(page));
    setValue("page", String(page));
  };

  console.log(errors);
  const { ref, width } = useResizeDetector();
  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currentPage <= 1}
            variant="ghost"
            aria-label="Previous Page"
            onClick={() => {
              setcurrentPage((prev) =>
                (setValue("page", String(prev - 1)), prev - 1 >= 1)
                  ? prev - 1
                  : 1
              );
            }}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{pagesNumbers ?? "x"}</span>
            </p>
          </div>
          <Button
            disabled={currentPage >= pagesNumbers!}
            variant="ghost"
            aria-label="Next Page"
            onClick={() => {
              setcurrentPage((prev) => {
                const next =
                  prev + 1 >= pagesNumbers! ? pagesNumbers! : prev + 1;
                setValue("page", String(next));
                return next;
              });
            }}
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-x-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className='gap-1.5'
                aria-label='zoom'
                variant='ghost'>
                <Search className='h-4 w-4' />
                {scale * 100}%
                <ChevronDown className='h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger >
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant='ghost'
            aria-label='rotate 90 degrees'>
            <RotateCw className='h-4 w-4' />
          </Button>

          <PdfFullscreen fileUrl={url} />
        
        </div>
      </div>
      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]' >
        <div ref={ref}>
          <Document
            onLoadSuccess={(pdf) => {
              setpagesNumbers(pdf.numPages);
            }}
            loading={
              <div className="flex justify-center text-zinc-700">
                <Loader className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
            onLoadError={() => {
              toast.custom(() => (
                <div className="bg-destructive text-white dark:bg-destructive/60 px-4 py-3 rounded-md shadow-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Something went wrong, please try again later</span>
                  </div>
                </div>
              ));
            }}
            file={url}
            className="max-h-full"
          >
            <Page width={width ? width : 1} pageNumber={currentPage} scale={scale} rotate={Rotation} />
          </Document>
        </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
