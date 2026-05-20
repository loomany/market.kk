type ExampleDisclaimerProps = {
  text: string;
};

export function ExampleDisclaimer({ text }: ExampleDisclaimerProps) {
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      {text}
    </p>
  );
}
