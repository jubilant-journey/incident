import { assert } from "chai";
import { Incident } from "../lib/index";

describe("Lazy message", function () {
  it("should call the formatter lazily on the first message read", function () {
    const callOrder: string[] = [];

    function exec() {
      callOrder.push("start-of-exec");
      const incident: Incident<"Lazy", {}, undefined> = new Incident("Lazy", (): string => {
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
      "end-of-exec",
    ]);
  });

  it("should call the formatter lazily on the first stack read", function () {
    const callOrder: string[] = [];

    function exec() {
      callOrder.push("start-of-exec");
      const incident: Incident<"Lazy", {}, undefined> = new Incident("Lazy", (): string => {
        callOrder.push("message-evaluation");
        return "Lazy error";
      });
      callOrder.push("created-incident");
      callOrder.push("before-read");
      assert.isString(incident.stack);
      callOrder.push("after-read");
      callOrder.push("before-read2");
      assert.isString(incident.stack);
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
      "end-of-exec",
    ]);
  });

  it("should call the formatter lazily on throw", function () {
    const callOrder: string[] = [];

    function exec() {
      callOrder.push("start-of-exec");
      const incident: Incident<"Lazy", {}, undefined> = new Incident("Lazy", (): string => {
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
      "end-of-exec",
    ]);
  });

  it("Conversion from Incident to Incident should not evaluate the message eagerly", function () {
    const callOrder: string[] = [];

    function exec() {
      callOrder.push("start-of-exec");
      const base: Incident<"Lazy", {}, undefined> = new Incident("Lazy", (): string => {
        callOrder.push("message-evaluation");
        return "Lazy error";
      });
      callOrder.push("created-base");
      const copy: Incident<"Lazy", {}, undefined> = Incident(base);
      callOrder.push("after-copy");
      callOrder.push("before-read");
      assert.isString(copy.message);
      callOrder.push("after-read");
      callOrder.push("end-of-exec");
    }

    exec();
    assert.deepEqual(callOrder, [
      "start-of-exec",
      "created-base",
      "after-copy",
      "before-read",
      "message-evaluation",
      "after-read",
      "end-of-exec",
    ]);
  });
});
