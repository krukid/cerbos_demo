import { type Contract } from './contract-model';

export function printContracts(contractsWithError: { contract?: Contract; error?: string; }[]) {
    contractsWithError.forEach((c) => {
        if (c.error) {
            console.log(`[ERR] ${c.error}`);
        } else if (!c.contract) {
            console.log(`[ERR] contract not found`);
        } else {
            console.log(`[OK ] contract found "${c.contract._id}"`);
        }
    });
}
