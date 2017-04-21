import {assert} from "chai";
import {Incident} from "../lib/incident";

interface IncidentLike<N extends string, D extends {}, C extends (Error | undefined)> {
  message: string;
  name: N;
  data: D;
  cause?: C;
  stack?: string;
}

function assertEqualErrors<N extends string, D extends {}, C extends (Error | undefined)>(
  actual: Incident<N, D, C>,
  expected: IncidentLike<N, D, C>
): void | never {
  for (const key in expected) {
    const actualProperty: any = (<any> actual)[key];
    const expectedProperty: any = (<any> expected)[key];
    assert.deepEqual(
      actualProperty,
      expectedProperty,
      `Expected \`${actualProperty}\` to be \`${expectedProperty}\` for ${key}`
    );
  }
}

describe("Incident", function () {
  it("should inherit from the native Error", function () {
    const incident: Incident<"Incident", {}, undefined> = new Incident();
    assert.instanceOf(incident, Error);
  });
});

describe("Incident constructors", function () {
  it("new Incident(cause,             message  )", function () {
    type Cause = Incident<"QuantumEffect", {}, undefined>;
    const cause: Cause = new Incident("QuantumEffect", "What is even a cause?");
    const incident: Incident<"Incident", {}, Cause> = new Incident(cause, "Quantum stuff is rad but weird");
    assertEqualErrors(incident, {
      cause: cause,
      name: "Incident",
      data: {},
      message: "Quantum stuff is rad but weird"
    });
  });

  it("new Incident(cause,             formatter)", function () {
    // These stunts are performed by trained professionals, don't try this at home
    type Cause = Incident<"NotANumber", {value: number}, undefined>;
    const numberBox: {value: number} = {value: NaN};
    const cause: Cause = new Incident("NotANumber", numberBox, "The number box contains NaN");
    const incident: Incident<"Incident", {}, Cause> = new Incident(
      cause,
      () => `Error with the number box containing ${numberBox.value}`
    );
    // Seriously, if you use a formatter with a lazy message, avoid to rely on mutable data reference you don't control
    numberBox.value = 0;
    assertEqualErrors(incident, {
      cause: cause,
      name: "Incident",
      data: {},
      message: "Error with the number box containing 0"
    });
  });

  it("new Incident(cause, name,       message  )", function () {
    type Cause = Incident<"Hardware", {}, undefined>;
    const cause: Cause = new Incident("Hardware", "This is a hardware issue");
    const incident: Incident<"LightBulb", {}, Cause> = new Incident(cause, "LightBulb", "Unable to change light bulb");
    assertEqualErrors(incident, {
      cause: cause,
      name: "LightBulb",
      data: {},
      message: "Unable to change light bulb"
    });
  });

  it("new Incident(cause, name,       formatter)", function () {
    type Cause = Incident<"CauseNotFound", {}, undefined>;
    const cause: Cause = new Incident("CauseNotFound", "Unable to find a cause to test with");
    const incident: Incident<"CauseFound", {}, Cause> = new Incident(
      cause,
      "CauseFound",
      () => "Found a cause"
    );
    assertEqualErrors(incident, {
      cause: cause,
      name: "CauseFound",
      data: {},
      message: "Found a cause"
    });
  });

  it("new Incident(                            )", function () {
    const incident: Incident<"Incident", {}, undefined> = new Incident();
    assertEqualErrors(incident, {
      name: Incident.name,
      data: {},
      message: ""
    });
  });

  it("new Incident(                   message  )", function () {
    const incident: Incident<"Incident", {}, undefined> = new Incident("Unable to fire the reactor!");
    assertEqualErrors(incident, {
      name: Incident.name,
      data: {},
      message: "Unable to fire the reactor!"
    });
  });

  it("new Incident(                   formatter)", function () {
    const incident: Incident<"Incident", {}, undefined> = new Incident(() => "The reactor is on fire!");
    assertEqualErrors(incident, {
      name: Incident.name,
      data: {},
      message: "The reactor is on fire!"
    });
  });

  it("new Incident(       name,       message  )", function () {
    const incident: Incident<"paradoxError", {}, undefined> = new Incident("paradoxError", "This is not an error");
    assertEqualErrors(incident, {
      name: "paradoxError",
      data: {},
      message: "This is not an error"
    });
  });

  it("new Incident(       name,       formatter)", function () {
    type ParadoxError = Incident<"paradoxError", {}, undefined>;
    const incident: ParadoxError = new Incident("paradoxError", () => "This is not an error");
    assertEqualErrors(incident, {
      name: "paradoxError",
      data: {},
      message: "This is not an error"
    });
  });

  it("new Incident(cause, name, data,          )", function () {
    type Cause = Incident<"WrapMe", {}, undefined>;
    const cause: Cause = new Incident("WrapMe", "This error justs draws attention to itself");
    const incident: Incident<"SimpleWrapper", {simple: true}, Cause> = new Incident(
      cause,
      "SimpleWrapper",
      {simple: true as true}
    );
    assertEqualErrors(incident, {
      cause: cause,
      name: "SimpleWrapper",
      data: {simple: true},
      message: ""
    });
  });

  it("new Incident(cause, name, data, message  )", function () {
    // Trivia: `example.com` is a special domain reserved by the IANA, anyone can use it for illustrative purposes
    type Cause = Incident<"ConnectionLost", {}, undefined>;
    const cause: Cause = new Incident("ConnectionLost", "Lost connection");
    const incident: Incident<"Network", {uri: string}, Cause> = new Incident(
      cause,
      "Network",
      {uri: "example.com"},
      "Unable to connect"
    );
    assertEqualErrors(incident, {
      cause: cause,
      name: "Network",
      data: {uri: "example.com"},
      message: "Unable to connect"
    });
  });

  it("new Incident(cause, name, data, formatter)", function () {
    type Cause = Incident<"MinLength", {minLength: number}, undefined>;
    const cause: Cause = new Incident("MinLength", {minLength: 59}, "Value must have `.length` ≥ 59");
    const incident: Incident<"InvalidCityName", {value: string}, Cause> = new Incident(
      cause,
      "InvalidCityName",
      {value: "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch"},
      (data: {value: string}): string => `The value ${JSON.stringify(data.value)} is an invalid city name`
    );
    assertEqualErrors(incident, {
      cause: cause,
      name: "InvalidCityName",
      data: {value: "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch"},
      message: `The value "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch" is an invalid city name`
    });
  });

  it("new Incident(cause,       data,          )", function () {
    type Cause = Incident<"NeedForEasyErrorManagement", {}, undefined>;
    const cause: Cause = new Incident("NeedForEasyErrorManagement", "");
    const now: Date = new Date();
    const incident: Incident<"Incident", {homepage: string, author: string}, Cause> = new Incident(
      cause,
      {homepage: "https://github.com/demurgos/incident", author: "Demurgos"}
    );
    assertEqualErrors(incident, {
      cause: cause,
      name: "Incident",
      data: {homepage: "https://github.com/demurgos/incident", author: "Demurgos"},
      message: ""
    });
  });

  it("new Incident(cause,       data, message  )", function () {
    type Cause = Incident<"Http", {status: number}, undefined>;
    const cause: Cause = new Incident("Http", {status: 200}, "200 - OK");
    const now: Date = new Date();
    const incident: Incident<"Incident", {time: Date}, Cause> = new Incident(
      cause,
      {time: now},
      "Surprise error"
    );
    assertEqualErrors(incident, {
      cause: cause,
      name: "Incident",
      data: {time: now},
      message: "Surprise error"
    });
  });

  it("new Incident(cause,       data, message  )", function () {
    type Cause = Incident<"Http", {status: number}, undefined>;
    const cause: Cause = new Incident("Http", {status: 200}, "200 - OK");
    const now: Date = new Date();
    const incident: Incident<"Incident", {time: Date}, Cause> = new Incident(
      cause,
      {time: now},
      "Surprise error"
    );
    assertEqualErrors(incident, {
      cause: cause,
      name: "Incident",
      data: {time: now},
      message: "Surprise error"
    });
  });

  it("new Incident(cause,       data, formatter)", function () {
    enum Unit {Kelvin, Celsius, Farenheit}
    type Cause = Incident<"Temperature", {temperature: number, unit: Unit}, undefined>;
    // Sorry if you use imperial units
    const cause: Cause = new Incident("Temperature", {temperature: -273.15, unit: Unit.Celsius}, "It's 0K");
    const incident: Incident<"Incident", {endOfTheWorld: boolean}, Cause> = new Incident(
      cause,
      {endOfTheWorld: true},
      (data: {endOfTheWorld: boolean}) => data.endOfTheWorld ? "Seems pretty serious" : "Could be worse"
    );
    assertEqualErrors(incident, {
      cause: cause,
      name: "Incident",
      data: {endOfTheWorld: true},
      message: "Seems pretty serious"
    });
  });

  it("new Incident(       name, data           )", function () {
    const incident: Incident<"AintNobodyGotTimeForMessages", {timeForMessages: number}, undefined> = new Incident(
      "AintNobodyGotTimeForMessages",
      {timeForMessages: 0}
    );
    assertEqualErrors(incident, {
      name: "AintNobodyGotTimeForMessages",
      data: {timeForMessages: 0},
      message: ""
    });
  });

  it("new Incident(       name, data, message  )", function () {
    const htmlRegExp: RegExp = /<html>/;
    const incident: Incident<"RegExp", {regExp: RegExp}, undefined> = new Incident(
      "RegExp",
      {regExp: htmlRegExp},
      "Now you have two errors"
    );
    assertEqualErrors(incident, {
      name: "RegExp",
      data: {regExp: htmlRegExp},
      message: "Now you have two errors"
    });
  });

  it("new Incident(       name, data, formatter)", function () {
    const antiRegExp: RegExp = /[^]/;
    const incident: Incident<"RegExp", {regex: RegExp}, undefined> = new Incident(
      "RegExp",
      {regex: antiRegExp},
      (data: {regex: RegExp}) => `The RegExp for ${JSON.stringify(data.regex.source)} does not want to cooperate`
    );
    assertEqualErrors(incident, {
      name: "RegExp",
      data: {regex: antiRegExp},
      message: `The RegExp for "[^]" does not want to cooperate`
    });
  });

  it("new Incident(             data           )", function () {
    const incident: Incident<"Incident", {port: number}, undefined> = new Incident({port: 50313});
    assertEqualErrors(incident, {
      name: Incident.name,
      data: {port: 50313},
      message: ""
    });
  });

  it("new Incident(             data, message  )", function () {
    // You know you're getting tired of coming up with errors when you resort to foo & bar...
    const incident: Incident<"Incident", {foo: string}, undefined> = new Incident({foo: "bar"}, "Foo/Bar");
    assertEqualErrors(incident, {
      name: Incident.name,
      data: {foo: "bar"},
      message: "Foo/Bar"
    });
  });

  it("new Incident(             data, formatter)", function () {
    const incident: Incident<"Incident", {bar: string}, undefined> = new Incident({bar: "foo"}, () => "Bar/Foo");
    assertEqualErrors(incident, {
      name: Incident.name,
      data: {bar: "foo"},
      message: "Bar/Foo"
    });
  });
});

describe("Lazy message", function () {
  it("should call the formatter lazily on first read", function () {
    const callOrder: string[] = [];

    function exec() {
      callOrder.push("start-of-exec");
      const incident: Incident<"Incident", {}, undefined> = new Incident((): string => {
        callOrder.push("message-evaluation");
        return "Lazy error";
      });
      callOrder.push("created-incident");
      callOrder.push("before-read");
      assert.isString(incident.message);
      callOrder.push("after-read");
      callOrder.push("before-read2");
      assert.isString(incident.message);
      callOrder.push("after-read2");
      callOrder.push("end-of-exec");
    }

    exec();
    assert.deepEqual(callOrder, [
      "start-of-exec",
      "created-incident",
      "before-read",
      "message-evaluation",
      "after-read",
      "before-read2",
      "after-read2",
      "end-of-exec"
    ]);
  });

  it("should call the formatter lazily on throw", function () {
    const callOrder: string[] = [];

    function exec() {
      callOrder.push("start-of-exec");
      const incident: Incident<"Incident", {}, undefined> = new Incident((): string => {
        callOrder.push("message-evaluation");
        return "Lazy error";
      });
      callOrder.push("created-incident");
      callOrder.push("before-throw");
      assert.throws(() => {
        throw incident;
      });
      callOrder.push("after-throw");
      callOrder.push("before-throw2");
      assert.throws(() => {
        throw incident;
      });
      callOrder.push("after-throw2");
      callOrder.push("end-of-exec");
    }

    exec();
    assert.deepEqual(callOrder, [
      "start-of-exec",
      "created-incident",
      "before-throw",
      "message-evaluation",
      "after-throw",
      "before-throw2",
      "after-throw2",
      "end-of-exec"
    ]);
  });
});

describe("Discriminated union", function () {
  it("should compile an exemple with raw interfaces", function () {
    {
      interface SyntaxError {
        name: "SyntaxError";
        index: number;
      }
      interface TypeError {
        name: "TypeError";
        typeName: string;
      }
      type BaseError = SyntaxError | TypeError;

      function printError(error: BaseError): void {
        switch (error.name) {
          case "SyntaxError":
            const index: number = error.index;
            break;
          case "TypeError":
            const typename: string = error.typeName;
            break;
        }
      }
    }
  });

  it("should compile an exemple with parametrized interfaces", function () {
    {
      interface ErrorInterface<N extends string, D extends {}> {
        name: N;
        data: D;
      }

      interface SyntaxError extends ErrorInterface<"SyntaxError", {index: number}> {
      }

      interface TypeError extends ErrorInterface<"TypeError", {typeName: string}> {
      }

      type BaseError = SyntaxError | TypeError;

      function printError(error: BaseError): void {
        switch (error.name) {
          case "SyntaxError":
            const index: number = error.data.index;
            break;
          case "TypeError":
            const typename: string = error.data.typeName;
            break;
        }
      }
    }
  });

  it("should compile a discriminated Incident", function () {
    {
      type SyntaxError = Incident<"SyntaxError", {index: number}, undefined>;
      type TypeError = Incident<"TypeError", {typeName: string}, undefined>;
      type BaseError = SyntaxError | TypeError;

      function printError(error: BaseError): void {
        switch (error.name) {
          case "SyntaxError":
            const index: number = error.data.index;
            break;
          case "TypeError":
            const typename: string = error.data.typeName;
            break;
        }
      }
    }
  });
});