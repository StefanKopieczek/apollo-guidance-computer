import { cycleLeft, cycleRight, edop, shiftRight } from '../../bitutils/math'
import { Environment } from '../../environment'
import { Memory, DirectRef, AddressOutOfBoundsError } from './memory'

const environment = Environment.COMMAND_MODULE
let memory = new Memory(environment)

beforeEach(() => {
  memory = new Memory(environment)
})

test('Resolve unswitched erasable address 0', () => {
  expect(memory.deduceAddress(0)).toEqual({
    kind: 'direct',
    address: 0
  })
})

test('Resolve unswitched erasable address 0o100', () => {
  expect(memory.deduceAddress(0o100)).toEqual({
    kind: 'direct',
    address: 0o100
  })
})

test('Resolve unswitched erasable address 0o477', () => {
  expect(memory.deduceAddress(0o477)).toEqual({
    kind: 'direct',
    address: 0o477
  })
})

test('Resolve unswitched erasable address 0o1377', () => {
  expect(memory.deduceAddress(0o1377)).toEqual({
    kind: 'direct',
    address: 0o1377
  })
})

test('Resolve switched erasable address bank 0 offset 0o100', () => {
  memory.registers.EBANK = 0
  expect(memory.deduceAddress(0o1500)).toEqual({
    kind: 'banked',
    bankId: 0,
    memoryType: 'erasable',
    offset: 0o100
  })
})

test('Resolve switched erasable address bank 0 offset 0o377', () => {
  memory.registers.EBANK = 0
  expect(memory.deduceAddress(0o1777)).toEqual({
    kind: 'banked',
    bankId: 0,
    memoryType: 'erasable',
    offset: 0o377
  })
})

test('Resolve switched erasable bank 1 offset 0o57', () => {
  memory.registers.EBANK = 0o400
  expect(memory.deduceAddress(0o1457)).toEqual({
    kind: 'banked',
    bankId: 1,
    memoryType: 'erasable',
    offset: 0o57
  })
})

test('Resolve switched erasable bank 5 offset 0o254', () => {
  memory.registers.EBANK = 0o2400
  expect(memory.deduceAddress(0o1654)).toEqual({
    kind: 'banked',
    bankId: 5,
    memoryType: 'erasable',
    offset: 0o254
  })
})

test('Resolve switched erasable bank 7 offset 0o377', () => {
  memory.registers.EBANK = 0o3400
  expect(memory.deduceAddress(0o1777)).toEqual({
    kind: 'banked',
    bankId: 7,
    memoryType: 'erasable',
    offset: 0o377
  })
})

test('Resolve unswitched fixed storage offset 0o4000', () => {
  expect(memory.deduceAddress(0o4000)).toEqual({
    kind: 'direct',
    address: 0o4000
  })
})

test('Resolve unswitched fixed storage offset 0o5123', () => {
  expect(memory.deduceAddress(0o5123)).toEqual({
    kind: 'direct',
    address: 0o5123
  })
})

test('Resolve unswitched fixed storage offset 0o5777', () => {
  expect(memory.deduceAddress(0o5777)).toEqual({
    kind: 'direct',
    address: 0o5777
  })
})

test('Resolve unswitched fixed storage offset 0o6000', () => {
  expect(memory.deduceAddress(0o6000)).toEqual({
    kind: 'direct',
    address: 0o6000
  })
})

test('Resolve unswitched fixed storage offset 0o6765', () => {
  expect(memory.deduceAddress(0o6765)).toEqual({
    kind: 'direct',
    address: 0o6765
  })
})

test('Resolve unswitched fixed storage offset 0o7777', () => {
  expect(memory.deduceAddress(0o7777)).toEqual({
    kind: 'direct',
    address: 0o7777
  })
})

test('Resolve switched fixed storage bank 0 offset 0o30', () => {
  memory.isSuperbankSet = false
  memory.registers.FBANK = 0
  expect(memory.deduceAddress(0o2030)).toEqual({
    kind: 'banked',
    bankId: 0,
    memoryType: 'fixed',
    offset: 0o30
  })
})

test('Resolve switched fixed storage bank 1 offset 0o1634', () => {
  memory.isSuperbankSet = false
  memory.registers.FBANK = 0o2000
  expect(memory.deduceAddress(0o3634)).toEqual({
    kind: 'banked',
    bankId: 1,
    memoryType: 'fixed',
    offset: 0o1634
  })
})

test('Resolve switched fixed storage bank 31 offset 0o1777', () => {
  memory.isSuperbankSet = false
  memory.registers.FBANK = 0o76000
  expect(memory.deduceAddress(0o3777)).toEqual({
    kind: 'banked',
    bankId: 31,
    memoryType: 'fixed',
    offset: 0o1777
  })
})

test('Resolve switched fixed storage bank 32 offset 0o1234', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o60000
  expect(memory.deduceAddress(0o3234)).toEqual({
    kind: 'banked',
    bankId: 32,
    memoryType: 'fixed',
    offset: 0o1234
  })
})

test('Resolve switched fixed storage bank 33 offset 0o234', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o62000
  expect(memory.deduceAddress(0o2234)).toEqual({
    kind: 'banked',
    bankId: 33,
    memoryType: 'fixed',
    offset: 0o0234
  })
})

test('Resolve switched fixed storage bank 35 offset 0o1777', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o66000
  expect(memory.deduceAddress(0o3777)).toEqual({
    kind: 'banked',
    bankId: 35,
    memoryType: 'fixed',
    offset: 0o1777
  })
})

test('Switched fixed bank 36 is dead', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o70000
  expect(memory.deduceAddress(0o3777)).toEqual({
    kind: 'deadbank'
  })
})

test('Switched fixed bank 39 is dead', () => {
  memory.isSuperbankSet = true
  memory.registers.FBANK = 0o76000
  expect(memory.deduceAddress(0o3000)).toEqual({
    kind: 'deadbank'
  })
})

test('Read from unswitched erasable (#1)', () => {
  memory.erasable.getBank(0)[0o100] = 0o12345
  expect(memory.read({
    kind: 'direct',
    address: 0o100
  })).toEqual(0o12345)
})

test('Read from to unswitched erasable (#2)', () => {
  // Each bank is 0o400 wide, so unswitched address 0o1234 points to bank 2 offset 0o234.
  memory.erasable.getBank(2)[0o234] = 0o54321
  expect(memory.read({
    kind: 'direct',
    address: 0o1234
  })).toEqual(0o54321)
})

test('Write to unswitched erasable (#1)', () => {
  memory.write({
    kind: 'direct',
    address: 0o100
  }, 0o12345)
  expect(memory.erasable.getBank(0)[0o100]).toEqual(0o12345)
})

test('Write to unswitched erasable (#2)', () => {
  // Each bank is 0o400 wide, so unswitched address 0o1234 points to bank 2 offset 0o234.
  memory.write({
    kind: 'direct',
    address: 0o1234
  }, 0o54321)
  expect(memory.erasable.getBank(2)[0o234]).toEqual(0o54321)
})

test('Memory is initialized to zero', () => {
  expect(memory.read({
    kind: 'direct',
    address: 0o1234
  })).toBe(0)
})

test('Direct out of bounds erasable read throws exception', () => {
  // This is out of bounds because it points into switched memory, which
  // the MemoryRef convention prevents (should use a BankedRef instead)
  expect(() => {
    memory.read({
      kind: 'direct',
      address: 0o1400
    })
  }).toThrow(AddressOutOfBoundsError)
})

test('Direct out of bounds fixed read throws exception (#1)', () => {
  // This is out of bounds because it points into switched memory, which
  // the MemoryRef convention prevents (should use a BankedRef instead)
  expect(() => {
    memory.read({
      kind: 'direct',
      address: 0o2000
    })
  }).toThrow(AddressOutOfBoundsError)
})

test('Direct out of bounds fixed read throws exception (#2)', () => {
  // This address is beyond the maximum address.
  expect(() => {
    memory.read({
      kind: 'direct',
      address: 0o10000
    })
  }).toThrow(AddressOutOfBoundsError)
})

test('Test read from erasable bank 0', () => {
  memory.erasable.getBank(0)[0o200] = 0o3565
  expect(memory.read({
      kind: 'banked',
      bankId: 0,
      offset: 0o200,
      memoryType: 'erasable'
    })
  ).toEqual(0o3565)
})

test('Test read from erasable bank 1', () => {
  memory.erasable.getBank(1)[0o300] = 0o4321
  expect(memory.read({
      kind: 'banked',
      bankId: 1,
      offset: 0o300,
      memoryType: 'erasable'
    })
  ).toEqual(0o4321)
})

test('Test read from erasable bank 7', () => {
  memory.erasable.getBank(7)[0o323] = 0o12345
  expect(memory.read({
      kind: 'banked',
      bankId: 7,
      offset: 0o323,
      memoryType: 'erasable'
    })
  ).toEqual(0o12345)
})

test('Test write to erasable bank 0', () => {
  memory.write({
    kind: 'banked',
    bankId: 0,
    offset: 0o234,
    memoryType: 'erasable'
  }, 0o23432)
  expect(memory.erasable.getBank(0)[0o234]).toEqual(0o23432)
})

test('Test write to erasable bank 1', () => {
  memory.write({
    kind: 'banked',
    bankId: 1,
    offset: 0o345,
    memoryType: 'erasable'
  }, 0o6543)
  expect(memory.erasable.getBank(1)[0o345]).toEqual(0o6543)
})

test('Test write to erasable bank 7', () => {
  memory.write({
    kind: 'banked',
    bankId: 7,
    offset: 0o111,
    memoryType: 'erasable'
  }, 0o22222)
  expect(memory.erasable.getBank(7)[0o111]).toEqual(0o22222)
})

test('Write to banked erasable, read from unswitched (Bank 0)', () => {
  // Bank 0 lines up with unswitched addresses [0o000, 0o400).
  memory.write({
    kind: 'banked',
    memoryType: 'erasable',
    bankId: 0,
    offset: 0o100
  }, 0o11111)

  expect(memory.read({
    kind: 'direct',
    address: 0o100
  })).toEqual(0o11111)
})

test('Write to banked erasable, read from unswitched (Bank 1)', () => {
  // Bank 1 lines up with unswitched addresses [0o0400, 0o1000).
  memory.write({
    kind: 'banked',
    memoryType: 'erasable',
    bankId: 1,
    offset: 0o200
  }, 0o22222)

  expect(memory.read({
    kind: 'direct',
    address: 0o600
  })).toEqual(0o22222)
})

test('Write to banked erasable, read from unswitched (Bank 2)', () => {
  // Bank 2 lines up with unswitched addresses [0o1000, 0o1400).
  memory.write({
    kind: 'banked',
    memoryType: 'erasable',
    bankId: 2,
    offset: 0o100
  }, 0o33333)

  expect(memory.read({
    kind: 'direct',
    address: 0o1100
  })).toEqual(0o33333)
})

test('Write to switched erasable, read from bank 0', () => {
  // Bank 0 lines up with unswitched addresses [0o000, 0o400).
  memory.write({
    kind: 'direct',    
    address: 0o100
  }, 0o11111)

  expect(memory.read({
    kind: 'banked',
    memoryType: 'erasable',
    bankId: 0,
    offset: 0o100
  })).toEqual(0o11111)
})

test('Write to switched erasable, read from bank 1', () => {
  // Bank 1 lines up with unswitched addresses [0o0400, 0o1000).
  memory.write({
    kind: 'direct',    
    address: 0o600
  }, 0o22222)

  expect(memory.read({
    kind: 'banked',
    memoryType: 'erasable',
    bankId: 1,
    offset: 0o200
  })).toEqual(0o22222)
})

test('Write to switched erasable, read from bank 2', () => {
  // Bank 2 lines up with unswitched addresses [0o1000, 0o1400).
  memory.write({
    kind: 'direct',    
    address: 0o1100
  }, 0o33333)

  expect(memory.read({
    kind: 'banked',
    memoryType: 'erasable',
    bankId: 2,
    offset: 0o100
  })).toEqual(0o33333)
})

test('Write to A register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o0
  }, 0o177777)
  expect(memory.registers.A).toEqual(0o177777)
})

test('Read from A register via memory', () => {
  memory.registers.A = 0o33
  expect(memory.read({
    kind: 'direct',
    address: 0o0
  })).toEqual(0o33)  
})

test('Writing a negative number to register A sets overflow bit', () => {
  memory.write({
    kind: 'direct',
    address: 0o0
  }, 0o77777)
  expect(memory.registers.A).toEqual(0o177777)
})

test('Writing a positive number to A resets overflow bit', () => {
  memory.registers.A = 0o100000
  memory.write({
    kind: 'direct',
    address: 0o0
  }, 0o33)
  expect(memory.registers.A).toEqual(0o33)
})

test('Reads from A are overflow corrected (#1)', () => {
  memory.registers.A = 0o100033
  expect(memory.read({
    kind: 'direct',
    address: 0o0
  })).toEqual(0o40033)
})

test('Reads from A are overflow corrected (#2)', () => {
  memory.registers.A = 0o077777
  expect(memory.read({
    kind: 'direct',
    address: 0o0
  })).toEqual(0o037777)
})

test('Registers cannot be read from via switched memory', () => {
  memory.registers.A = 0x33
  expect(memory.read({
    kind: 'banked',
    bankId: 0,
    offset: 0,
    memoryType: 'erasable'
  })).toEqual(0)
})

test('Registers cannot be written to via switched memory', () => {
  memory.write({
    kind: 'banked',    
    bankId: 0,
    offset: 0,
    memoryType: 'erasable'
  }, 0x1234)
  expect(memory.registers.A).toEqual(0)
})

test('Write to L register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o1
  }, 0o33)
  expect(memory.registers.L).toEqual(0o33)
})

test('Read from L register via memory', () => {
  memory.registers.L = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o1
  })).toEqual(0o44)  
})

test('Write to Q register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o2
  }, 0o33)
  expect(memory.registers.Q).toEqual(0o33)
})

test('Read from Q register via memory', () => {
  memory.registers.Q = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o2
  })).toEqual(0o44)  
})

test('Writing a negative number to register Q sets overflow bit', () => {
  memory.write({
    kind: 'direct',
    address: 0o2
  }, 0o77777)
  expect(memory.registers.Q).toEqual(0o177777)
})

test('Writing a positive number to Q resets overflow bit', () => {
  memory.registers.Q = 0o100000
  memory.write({
    kind: 'direct',
    address: 0o2
  }, 0o33)
  expect(memory.registers.Q).toEqual(0o33)
})

test('Reads from Q are overflow corrected (#1)', () => {
  memory.registers.Q = 0o100033
  expect(memory.read({
    kind: 'direct',
    address: 0o2
  })).toEqual(0o40033)
})

test('Reads from Q are overflow corrected (#2)', () => {
  memory.registers.Q = 0o077777
  expect(memory.read({
    kind: 'direct',
    address: 0o2
  })).toEqual(0o037777)
})

test('Write to EBANK register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o3
  }, 0o2000)
  expect(memory.registers.EBANK).toEqual(0o2000)
})

test('Read from EBANK register via memory', () => {
  memory.registers.EBANK = 0o1400
  expect(memory.read({
    kind: 'direct',
    address: 0o3
  })).toEqual(0o1400)  
})

test('Write to FBANK register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o4
  }, 0o36000)
  expect(memory.registers.FBANK).toEqual(0o36000)
})

test('Read from FBANK register via memory', () => {
  memory.registers.FBANK = 0o70000
  expect(memory.read({
    kind: 'direct',
    address: 0o4
  })).toEqual(0o70000)  
})

test('Write to Z register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o5
  }, 0o33)
  expect(memory.registers.Z).toEqual(0o33)
})

test('Read from Z register via memory', () => {
  memory.registers.Z = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o5
  })).toEqual(0o44)  
})

test('Write to BBANK register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o6
  }, 0o36007)
  expect(memory.registers.BBANK).toEqual(0o36007)
})

test('Read from BBANK register via memory', () => {
  memory.registers.BBANK = 0o70001
  expect(memory.read({
    kind: 'direct',
    address: 0o6
  })).toEqual(0o70001)  
})

test('Writes to the zero register are dropped', () => {
  memory.write({
    kind: 'direct',
    address: 0o7
  }, 0o12345)
  expect(memory.read({
    kind: 'direct',
    address: 0o7
  })).toEqual(0)
})

test('Write to ARUPT register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o10
  }, 0o33)
  expect(memory.registers.ARUPT).toEqual(0o33)
})

test('Read from ARUPT register via memory', () => {
  memory.registers.ARUPT = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o10
  })).toEqual(0o44)  
})

test('Write to LRUPT register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o11
  }, 0o33)
  expect(memory.registers.LRUPT).toEqual(0o33)
})

test('Read from LRUPT register via memory', () => {
  memory.registers.LRUPT = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o11
  })).toEqual(0o44)  
})

test('Write to QRUPT register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o12
  }, 0o33)
  expect(memory.registers.QRUPT).toEqual(0o33)
})

test('Read from QRUPT register via memory', () => {
  memory.registers.QRUPT = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o12
  })).toEqual(0o44)  
})

test('Write to SAMPTIME_1 register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o13
  }, 0o33)
  expect(memory.registers.SAMPTIME_1).toEqual(0o33)
})

test('Read from SAMPTIME_1 register via memory', () => {
  memory.registers.SAMPTIME_1 = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o13
  })).toEqual(0o44)  
})

test('Write to SAMPTIME_2 register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o14
  }, 0o33)
  expect(memory.registers.SAMPTIME_2).toEqual(0o33)
})

test('Read from SAMPTIME_2 register via memory', () => {
  memory.registers.SAMPTIME_2 = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o14
  })).toEqual(0o44)  
})

test('Write to ZRUPT register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o15
  }, 0o33)
  expect(memory.registers.ZRUPT).toEqual(0o33)
})

test('Read from ZRUPT register via memory', () => {
  memory.registers.ZRUPT = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o15
  })).toEqual(0o44)  
})

test('Write to BBRUPT register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o16
  }, 0o33)
  expect(memory.registers.BBRUPT).toEqual(0o33)
})

test('Read from BBRUPT register via memory', () => {
  memory.registers.BBRUPT = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o16
  })).toEqual(0o44)  
})

test('Write to BRUPT register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o17
  }, 0o33)
  expect(memory.registers.BRUPT).toEqual(0o33)
})

test('Read from BRUPT register via memory', () => {
  memory.registers.BRUPT = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o17
  })).toEqual(0o44)  
})

test('Write to CYR register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o20
  }, 0o33)
  expect(memory.registers.CYR).toEqual(cycleRight(0o33))
})

test('Read from CYR register via memory', () => {
  memory.registers.CYR = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o20
  })).toEqual(cycleRight(0o44))
})

test('Write to SR register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o21
  }, 0o33)
  expect(memory.registers.SR).toEqual(shiftRight(0o33))
})

test('Read from SR register via memory', () => {
  memory.registers.SR = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o21
  })).toEqual(shiftRight(0o44))
})

test('Write to CYL register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o22
  }, 0o33)
  expect(memory.registers.CYL).toEqual(cycleLeft(0o33))
})

test('Read from CYL register via memory', () => {
  memory.registers.CYL = 0o44
  expect(memory.read({
    kind: 'direct',
    address: 0o22
  })).toEqual(cycleLeft(0o44))
})

test('Write to EDOP register via memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o23
  }, 0o33333)
  expect(memory.registers.EDOP).toEqual(edop(0o33333))
})

test('Read from EDOP register via memory', () => {
  memory.registers.EDOP = 0o44444
  expect(memory.read({
    kind: 'direct',
    address: 0o23
  })).toEqual(edop(0o44444))
})

test('Read from fixed unswitched memory (#1)', () => {
  // Banks 2 and 3 of fixed memory are accessible without switching.
  // Bank 2 is at [0o4000, 0o6000).
  memory.fixed.getBank(2)[0] = 0o777
  expect(memory.read({
    kind: 'direct',
    address: 0o4000
  })).toEqual(0o777)
})

test('Read from fixed unswitched memory (#2)', () => {
  // Banks 2 and 3 of fixed memory are accessible without switching.
  // Bank 3 is at [0o6000, 0o8000).
  memory.fixed.getBank(3)[0o123] = 0o65432
  expect(memory.read({
    kind: 'direct',
    address: 0o6123
  })).toEqual(0o65432)
})

test('Cannot write to fixed unswitched memory', () => {
  memory.write({
    kind: 'direct',
    address: 0o4567
  }, 0o1234)  
  expect(memory.read({
    kind: 'direct',
    address: 0o4567
  })).toEqual(0)
})

test('Read from banked fixed memory (#1)', () => {
  memory.fixed.getBank(27)[0o1234] = 0o54321
  expect(memory.read({
    kind: 'banked',
    bankId: 27,
    offset: 0o1234,
    memoryType: 'fixed'
  })).toEqual(0o54321)
})

test('Read from banked fixed memory (#2)', () => {
  memory.fixed.getBank(35)[0o1234] = 0o54321
  expect(memory.read({
    kind: 'banked',
    bankId: 35,
    offset: 0o1234,
    memoryType: 'fixed'
  })).toEqual(0o54321)
})

test('Read from deadbank is always 0', () => {
  memory.write({kind: 'deadbank'}, 0o1234)
  expect(memory.read({kind: 'deadbank'})).toEqual(0)
})