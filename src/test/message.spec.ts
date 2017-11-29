import { assert } from "chai";
import { Incident } from "../lib/index";

describe("Message", function () {
  it("`.message` string is mutable", function () {
    const incident: Incident<{}> = new Incident("SomeError", "This message will mutate");
    const oldMessage: string = incident.message;
    assert.isString(oldMessage);
    incident.message = "This is a new message";
    const newMessage: string = incident.message;
    assert.equal(newMessage, "This is a new message");
    assert.notEqual(newMessage, oldMessage);
  });

  it("eager `.message` formatter is mutable", function () {
    const incident: Incident<{}> = new Incident("SomeError", () => "This message will mutate");
    const oldMessage: string = incident.message;
    assert.isString(oldMessage);
    incident.message = "This is a new message";
    const newMessage: string = incident.message;
    assert.equal(newMessage, "This is a new message");
    assert.notEqual(newMessage, oldMessage);
  });

  it("lazy `.message` formatter is mutable", function () {
    const incident: Incident<{}> = new Incident("SomeError", () => "This message will mutate");
    incident.message = "This is a new message";
    const newMessage: string = incident.message;
    assert.equal(newMessage, "This is a new message");
  });
});
