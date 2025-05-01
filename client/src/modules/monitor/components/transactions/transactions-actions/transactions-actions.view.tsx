import { Button } from "@/components/ui/button";

interface TransactionsActionsProps {
  handleResume: () => void;
  handlePause: () => void;
}

export const TransactionsActions = ({
  handlePause,
  handleResume,
}: TransactionsActionsProps) => {
  return (
    <>
      <Button
        variant="destructive"
        className="cursor-pointer"
        onClick={() => handlePause()}
      >
        Stop
      </Button>

      <Button
        variant="default"
        className="cursor-pointer"
        onClick={() => handleResume()}
      >
        Start
      </Button>
    </>
  );
};
