const { TodoService } = require("../../service/todo");
const { Todo } = require("../../../models/todo");
const {
  validatePasswordToken,
  issueResetPassToken,
  issueToken,
} = require("../../middleware/auth");
const { ResetPasswordTokens } = require("../../../models/resetPasswordTokens");
const ERROR_CODES = require("../../constant/error-messages");
const { emailService } = require("../../utils/email");

jest.mock("../../../models/todo", () => ({
  Todo: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));
describe("service/admins", () => {
  beforeEach(() => {
    Todo.create.mockReset();
    Todo.findOne.mockReset();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("create()", () => {
    let body = {
      name: "Jhon Doe",
      status: true,
    };

    it(`should throw error ${ERROR_CODES.TODO_ALREADY_EXISTS.message}`, async () => {
      try {
        Todo.findOne.mockResolvedValueOnce(true);
        await TodoService.create(body);
      } catch (error) {
        expect(error.message).toBeDefined();
        expect(error.message).toEqual(ERROR_CODES.TODO_ALREADY_EXISTS.message);
      }
    });

    it(`should create a todo entry`, async () => {
      Todo.findOne.mockResolvedValueOnce(null);
      Todo.create.mockResolvedValueOnce(true);
      const response = await TodoService.create(body);
      expect(response).toBeDefined();
      expect(response).toBe(true);
    });
  });

});
