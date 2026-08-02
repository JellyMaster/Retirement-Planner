export interface SequenceReturnsInput {
  startingBalance: number;
  annualWithdrawal: number;
  retirementAge: number;
  durationYears: number;
  shockPercentage: number;
  normalReturn: number;
}

export interface SequenceReturnsYear {
  year: number;
  age: number;
  returnRate: number;
  openingBalance: number;
  investmentChange: number;
  withdrawal: number;
  closingBalance: number;
}

export interface SequenceReturnsJourney {
  label: "early-loss" | "late-loss";
  returns: number[];
  years: SequenceReturnsYear[];
  endingBalance: number;
  lowestBalance: number;
  depletionAge: number | null;
  arithmeticAverageReturn: number;
  compoundedReturn: number;
}

export interface SequenceReturnsComparison {
  earlyLoss: SequenceReturnsJourney;
  lateLoss: SequenceReturnsJourney;
  endingBalanceDifference: number;
}

export function calculateSequenceReturns(
  input: SequenceReturnsInput,
): SequenceReturnsComparison {
  const durationYears = Math.max(1, Math.round(input.durationYears));
  const shock = -Math.min(0.75, Math.max(0, input.shockPercentage));
  const normalReturn = Math.min(0.25, Math.max(-0.25, input.normalReturn));
  const sharedReturns = Array.from(
    { length: durationYears },
    (_, index) => (index === 0 ? shock : normalReturn),
  );

  const earlyLoss = simulateJourney("early-loss", sharedReturns, input);
  const lateLoss = simulateJourney(
    "late-loss",
    [...sharedReturns].reverse(),
    input,
  );

  return {
    earlyLoss,
    lateLoss,
    endingBalanceDifference:
      lateLoss.endingBalance - earlyLoss.endingBalance,
  };
}

function simulateJourney(
  label: SequenceReturnsJourney["label"],
  returns: number[],
  input: SequenceReturnsInput,
): SequenceReturnsJourney {
  let balance = Math.max(0, input.startingBalance);
  let lowestBalance = balance;
  let depletionAge: number | null = null;

  const years = returns.map((returnRate, index): SequenceReturnsYear => {
    const age = input.retirementAge + index;
    const openingBalance = balance;
    const investmentChange = openingBalance * returnRate;
    const availableAfterReturn = Math.max(0, openingBalance + investmentChange);
    const withdrawal = Math.min(
      availableAfterReturn,
      Math.max(0, input.annualWithdrawal),
    );
    balance = Math.max(0, availableAfterReturn - withdrawal);
    lowestBalance = Math.min(lowestBalance, balance);

    if (balance === 0 && depletionAge === null) {
      depletionAge = age;
    }

    return {
      year: index + 1,
      age,
      returnRate,
      openingBalance,
      investmentChange,
      withdrawal,
      closingBalance: balance,
    };
  });

  const arithmeticAverageReturn =
    returns.reduce((total, value) => total + value, 0) / returns.length;
  const compoundedReturn =
    returns.reduce((product, value) => product * (1 + value), 1) - 1;

  return {
    label,
    returns,
    years,
    endingBalance: balance,
    lowestBalance,
    depletionAge,
    arithmeticAverageReturn,
    compoundedReturn,
  };
}
