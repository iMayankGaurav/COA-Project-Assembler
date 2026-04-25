// Dictionaries
const OPCODES = { "add": "0000", "sub": "0001", "mul": "0010", "div": "0011", "mod": "0100", "mov": "0101", "cmp": "0110", "beq": "0111", "bgt": "1000", "b": "1001", "hlt": "1111" };
const REGISTERS = { "r0": "000", "r1": "001", "r2": "010", "r3": "011", "r4": "100", "r5": "101", "r6": "110", "r7": "111" };

// Reverse Dictionaries for Disassembly
const REV_OPCODES = Object.fromEntries(Object.entries(OPCODES).map(([k, v]) => [v, k]));
const REV_REGISTERS = Object.fromEntries(Object.entries(REGISTERS).map(([k, v]) => [v, k]));

function assemble() {
    const source = document.getElementById("assemblyInput").value;
    const lines = source.split('\n');
    const machineCode = [];

    for (let line of lines) {
        let l = line.trim();
        if (!l || l.startsWith("//")) continue; // Skip empty and comments

        l = l.replace(/,/g, ' '); // Replace commas with spaces
        let parts = l.split(/\s+/); // Split by spaces
        
        let inst = parts[0].toLowerCase();
        if (!OPCODES[inst]) {
            machineCode.push(`ERROR: Unknown instruction '${inst}'`);
            continue;
        }

        let machine = OPCODES[inst];

        // Process arguments
        for (let i = 1; i < parts.length; i++) {
            let p = parts[i].toLowerCase();
            if (REGISTERS[p]) {
                machine += REGISTERS[p];
            } else {
                let val = parseInt(p, 10);
                if (isNaN(val)) {
                    machine = `ERROR: Invalid value '${p}'`;
                    break;
                }
                // Convert to 8-bit binary
                machine += val.toString(2).padStart(8, '0');
            }
        }
        machineCode.push(machine);
    }
    document.getElementById("machineInput").value = machineCode.join('\n');
}

function disassemble() {
    const source = document.getElementById("machineInput").value;
    const lines = source.split('\n');
    const assemblyCode = [];

    for (let line of lines) {
        let l = line.trim();
        if (!l) continue;

        if (l.length < 4) {
            assemblyCode.push(`ERROR: Line too short '${l}'`);
            continue;
        }

        let opcode_bin = l.substring(0, 4);
        if (!REV_OPCODES[opcode_bin]) {
            assemblyCode.push(`ERROR: Unknown Opcode '${opcode_bin}'`);
            continue;
        }

        let inst = REV_OPCODES[opcode_bin];
        let rem_len = l.length - 4;
        let decoded_args = "";

        try {
            if (rem_len === 0) { } 
            else if (rem_len === 8) {
                decoded_args = parseInt(l.substring(4, 12), 2).toString();
            } else if (rem_len === 9) {
                let rA = REV_REGISTERS[l.substring(4, 7)];
                let rB = REV_REGISTERS[l.substring(7, 10)];
                let rC = REV_REGISTERS[l.substring(10, 13)];
                decoded_args = `${rA}, ${rB}, ${rC}`;
            } else if (rem_len === 11) {
                let rA = REV_REGISTERS[l.substring(4, 7)];
                let imm = parseInt(l.substring(7, 15), 2).toString();
                decoded_args = `${rA}, ${imm}`;
            } else if (rem_len === 14) {
                // NEW: 2 Registers + 1 Immediate (3 + 3 + 8 = 14 bits)
                let rA = REV_REGISTERS[l.substring(4, 7)];
                let rB = REV_REGISTERS[l.substring(7, 10)];
                let imm = parseInt(l.substring(10, 18), 2).toString();
                decoded_args = `${rA}, ${rB}, ${imm}`;
            } else {
                decoded_args = " (Format Error)";
            }
        } catch (e) {
            decoded_args = " (Parse Error)";
        }

        assemblyCode.push(decoded_args ? `${inst} ${decoded_args}` : inst);
    }
    document.getElementById("assemblyInput").value = assemblyCode.join('\n');
}
