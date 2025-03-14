import { All_transactions } from "../../../components/All_transactions";
import getUsersTxn from "../../lib/actions/getUsersTxn";

export default async function () {
    const txns = await getUsersTxn();
    return (
        <div className="h-full w-full bg-green">
            <div>
                <All_transactions txns={txns} />
            </div>
        </div>
    )
}