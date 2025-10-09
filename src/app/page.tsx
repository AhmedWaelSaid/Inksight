import MaxwidthWrapper from "./component/MaxwidthWrapper";

export default function Home() {
  return (
 <MaxwidthWrapper ClassName="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
  <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-200 hover:bg-white/50">
 <p className="text-sm text-gray-700 font-semibold">Read-H is now public!</p>
  </div>
  </MaxwidthWrapper>
  );
}
