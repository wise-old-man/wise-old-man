'use client'

import { EfficiencyAlgorithmType } from "@wise-old-man/utils";
import { createContext, useContext, useState } from "react";

export const AccountAlgorithmContext = createContext({
    algorithm: EfficiencyAlgorithmType.MAIN,
    setAlgorithm: (algorithm: EfficiencyAlgorithmType) => {}
});

export const AccountAlgorithmProvider = ({ children }: { children: React.ReactNode | React.ReactNode[]}) => {
    const [algorithm, setAlgorithm] = useState<EfficiencyAlgorithmType>(EfficiencyAlgorithmType.MAIN);

    return (
        <AccountAlgorithmContext.Provider value={{ algorithm, setAlgorithm }}>
            { children }
        </AccountAlgorithmContext.Provider>
    )
}

export const useAccountAlgorithm = () => {
    const context = useContext(AccountAlgorithmContext);

    if (! context) {
        throw new Error('useAccountAlgorithm was used outside of the provider.');
    }

    return context;
}


