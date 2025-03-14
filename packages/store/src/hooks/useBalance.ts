"use client"

import { useAtomValue } from "jotai"
import { balanceAtom } from "../atoms/balance"

export const useBalance = () => {
    const balance = useAtomValue(balanceAtom);
    return balance;
}