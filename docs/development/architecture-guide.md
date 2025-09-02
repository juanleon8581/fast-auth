# Architecture and Design Patterns Guide

This guide describes the Fast Auth API project architecture, implemented design patterns, and architectural best practices.

## General Architecture

### Clean Architecture

The project follows Clean Architecture principles, organizing code in layers with dependencies flowing inward:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Interface Adapters                     │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │            Application Business Rules       │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │     Enterprise Business Rules       │    │    │    │
│  │  │  │                                     │    │    │    │
│  │  │  │           Domain Layer              │    │    │    │
│  │  │  │        (Entities, DTOs)             │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  │                                             │    │    │
│  │  │           Application Layer                 │    │    │
│  │  │        (Use Cases, Interfaces)              │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                     │    │
│  │              Presentation Layer                     │    │
│  │        (Controllers, Routes, Middleware)            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│               Infrastructure Layer                          │
│        (Database, External APIs, File System)               │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── domain/                     # Enterprise Business Rules
│   ├── entities/               # Domain entities
│   ├── dtos/                   # Data Transfer Objects
│   └── interfaces/             # Domain contracts
├── application/                # Application Business Rules
│   ├── use-cases/             # Use cases
│   ├── interfaces/            # Application contracts
│   └── validators/            # Business validators
├── presentation/               # Interface Adapters
│   ├── controllers/           # HTTP controllers
│   ├── routes/               # Route definitions
│   ├── middleware/           # Application middleware
│   └── validators/           # Input validators
└── infrastructure/            # Frameworks & Drivers
    ├── config/               # Configurations
    ├── database/             # Data access
    ├── services/             # External services
    └── utils/                # Utilities
```

## Implemented Design Patterns

### 1. Repository Pattern

Separates data access logic from business logic.

```typescript
// Domain Interface
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: CreateUserDTO): Promise<User>;
  update(id: string, user: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

// Infrastructure Implementation
export class PostgresUserRepository implements UserRepository {
  constructor(private database: Database) {}

  async findById(id: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await this.database.query(query, [id]);
    return result.rows[0] ? this.mapToEntity(result.rows[0]) : null;
  }

  private mapToEntity(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
```

### 2. Dependency Injection

Uses an IoC container to manage dependencies.

```typescript
// Container Configuration
import { Container } from "inversify";
import { TYPES } from "./types";

const container = new Container();

// Repositories
container
  .bind<UserRepository>(TYPES.UserRepository)
  .to(PostgresUserRepository)
  .inSingletonScope();

// Use Cases
container
  .bind<LoginUserUseCase>(TYPES.LoginUserUseCase)
  .to(LoginUserUseCase)
  .inTransientScope();

// Controllers
container
  .bind<AuthController>(TYPES.AuthController)
  .to(AuthController)
  .inTransientScope();

export { container };
```

### 3. Factory Pattern

Creates objects without specifying their exact class.

```typescript
// Response Factory
export class ResponseFactory {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message: message || "Operation successful",
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string,
    code?: string,
    details?: any,
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        message,
        code: code || "INTERNAL_ERROR",
        details,
        timestamp: new Date().toISOString(),
      },
    };
  }

  static validation(errors: ValidationError[]): ApiErrorResponse {
    return {
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
```

### 4. Strategy Pattern

Allows selecting algorithms at runtime.

```typescript
// Authentication Strategy
export interface AuthStrategy {
  authenticate(token: string): Promise<User | null>;
}

export class JWTAuthStrategy implements AuthStrategy {
  constructor(private jwtService: JWTService) {}

  async authenticate(token: string): Promise<User | null> {
    try {
      const payload = this.jwtService.verify(token);
      return await this.userRepository.findById(payload.userId);
    } catch (error) {
      return null;
    }
  }
}

export class ApiKeyAuthStrategy implements AuthStrategy {
  constructor(private apiKeyService: ApiKeyService) {}

  async authenticate(apiKey: string): Promise<User | null> {
    return await this.apiKeyService.validateApiKey(apiKey);
  }
}

// Context
export class AuthContext {
  constructor(private strategy: AuthStrategy) {}

  setStrategy(strategy: AuthStrategy): void {
    this.strategy = strategy;
  }

  async authenticate(credentials: string): Promise<User | null> {
    return await this.strategy.authenticate(credentials);
  }
}
```

### 5. Observer Pattern

Implements an event system to decouple components.

```typescript
// Event System
export interface DomainEvent {
  eventName: string;
  occurredOn: Date;
  eventData: any;
}

export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  subscribe<T extends DomainEvent>(
    eventName: string,
    handler: EventHandler<T>,
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventName) || [];
    await Promise.all(handlers.map((handler) => handler.handle(event)));
  }
}

// Event Implementation
export class UserRegisteredEvent implements DomainEvent {
  eventName = "user.registered";
  occurredOn = new Date();

  constructor(public eventData: { userId: string; email: string }) {}
}

export class SendWelcomeEmailHandler
  implements EventHandler<UserRegisteredEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail(
      event.eventData.email,
      event.eventData.userId,
    );
  }
}
```

### 6. Command Pattern

Encapsulates a request as an object.

```typescript
// Command Interface
export interface Command<T = any> {
  execute(): Promise<T>;
  undo?(): Promise<void>;
}

// Concrete Commands
export class CreateUserCommand implements Command<User> {
  constructor(
    private userRepository: UserRepository,
    private userData: CreateUserDTO,
  ) {}

  async execute(): Promise<User> {
    return await this.userRepository.create(this.userData);
  }

  async undo(): Promise<void> {
    // Implementation for rollback
  }
}

export class UpdateUserCommand implements Command<User> {
  private originalUser: User | null = null;

  constructor(
    private userRepository: UserRepository,
    private userId: string,
    private updateData: UpdateUserDTO,
  ) {}

  async execute(): Promise<User> {
    this.originalUser = await this.userRepository.findById(this.userId);
    return await this.userRepository.update(this.userId, this.updateData);
  }

  async undo(): Promise<void> {
    if (this.originalUser) {
      await this.userRepository.update(this.userId, this.originalUser);
    }
  }
}

// Command Invoker
export class CommandBus {
  private history: Command[] = [];

  async execute<T>(command: Command<T>): Promise<T> {
    const result = await command.execute();
    this.history.push(command);
    return result;
  }

  async undo(): Promise<void> {
    const command = this.history.pop();
    if (command && command.undo) {
      await command.undo();
    }
  }
}
```

### 7. Decorator Pattern

Adds functionality to objects dynamically.

```typescript
// Base Use Case
export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// Decorators
export class LoggingDecorator<TRequest, TResponse>
  implements UseCase<TRequest, TResponse>
{
  constructor(
    private useCase: UseCase<TRequest, TResponse>,
    private logger: Logger,
  ) {}

  async execute(request: TRequest): Promise<TResponse> {
    const startTime = Date.now();
    this.logger.info("Use case started", {
      useCase: this.useCase.constructor.name,
      request,
    });

    try {
      const result = await this.useCase.execute(request);
      const duration = Date.now() - startTime;
      this.logger.info("Use case completed", { duration, result });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error("Use case failed", { duration, error });
      throw error;
    }
  }
}

export class CachingDecorator<TRequest, TResponse>
  implements UseCase<TRequest, TResponse>
{
  constructor(
    private useCase: UseCase<TRequest, TResponse>,
    private cache: CacheService,
    private ttl: number = 300, // 5 minutes
  ) {}

  async execute(request: TRequest): Promise<TResponse> {
    const cacheKey = this.generateCacheKey(request);
    const cached = await this.cache.get<TResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const result = await this.useCase.execute(request);
    await this.cache.set(cacheKey, result, this.ttl);
    return result;
  }

  private generateCacheKey(request: TRequest): string {
    return `${this.useCase.constructor.name}:${JSON.stringify(request)}`;
  }
}

export class ValidationDecorator<TRequest, TResponse>
  implements UseCase<TRequest, TResponse>
{
  constructor(
    private useCase: UseCase<TRequest, TResponse>,
    private validator: Validator<TRequest>,
  ) {}

  async execute(request: TRequest): Promise<TResponse> {
    await this.validator.validate(request);
    return await this.useCase.execute(request);
  }
}
```

## SOLID Principles

### 1. Single Responsibility Principle (SRP)

Each class has a single reason to change.

```typescript
// ❌ SRP Violation
class UserService {
  async createUser(userData: CreateUserDTO): Promise<User> {
    // Validation
    if (!userData.email) throw new Error("Email required");

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Save to database
    const query = "INSERT INTO users...";
    const result = await database.query(query, [
      userData.email,
      hashedPassword,
    ]);

    // Send email
    await emailService.sendWelcomeEmail(userData.email);

    return result.rows[0];
  }
}

// ✅ Following SRP
class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private eventBus: EventBus,
  ) {}

  async execute(userData: CreateUserDTO): Promise<User> {
    const hashedPassword = await this.passwordService.hash(userData.password);
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    await this.eventBus.publish(
      new UserRegisteredEvent({
        userId: user.id,
        email: user.email,
      }),
    );

    return user;
  }
}
```

### 2. Open/Closed Principle (OCP)

Open for extension, closed for modification.

```typescript
// Base class
abstract class NotificationService {
  abstract send(message: string, recipient: string): Promise<void>;
}

// Extensions
class EmailNotificationService extends NotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Email implementation
  }
}

class SMSNotificationService extends NotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // SMS implementation
  }
}

class PushNotificationService extends NotificationService {
  async send(message: string, recipient: string): Promise<void> {
    // Push notification implementation
  }
}

// Context that uses notifications
class NotificationContext {
  constructor(private services: NotificationService[]) {}

  async sendToAll(message: string, recipient: string): Promise<void> {
    await Promise.all(
      this.services.map((service) => service.send(message, recipient)),
    );
  }
}
```

### 3. Liskov Substitution Principle (LSP)

Derived objects must be substitutable for their base objects.

```typescript
// Base interface
interface PaymentProcessor {
  processPayment(amount: number, currency: string): Promise<PaymentResult>;
}

// Implementations that follow LSP
class StripePaymentProcessor implements PaymentProcessor {
  async processPayment(
    amount: number,
    currency: string,
  ): Promise<PaymentResult> {
    // Stripe-specific implementation
    return { success: true, transactionId: "stripe_123" };
  }
}

class PayPalPaymentProcessor implements PaymentProcessor {
  async processPayment(
    amount: number,
    currency: string,
  ): Promise<PaymentResult> {
    // PayPal-specific implementation
    return { success: true, transactionId: "paypal_456" };
  }
}

// Client code works with any implementation
class PaymentService {
  constructor(private processor: PaymentProcessor) {}

  async makePayment(amount: number, currency: string): Promise<PaymentResult> {
    return await this.processor.processPayment(amount, currency);
  }
}
```

### 4. Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use.

```typescript
// ❌ ISP Violation
interface UserOperations {
  create(user: CreateUserDTO): Promise<User>;
  update(id: string, user: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  sendEmail(id: string, message: string): Promise<void>;
  generateReport(): Promise<Report>;
}

// ✅ Following ISP
interface UserReader {
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

interface UserWriter {
  create(user: CreateUserDTO): Promise<User>;
  update(id: string, user: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

interface UserNotifier {
  sendEmail(id: string, message: string): Promise<void>;
}

interface UserReporter {
  generateReport(): Promise<Report>;
}

// Implementations use only what they need
class UserRepository implements UserReader, UserWriter {
  // Implementation
}

class UserEmailService implements UserNotifier {
  // Implementation
}
```

### 5. Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions.

```typescript
// ❌ DIP Violation
class OrderService {
  private emailService = new EmailService(); // Concrete dependency
  private database = new PostgresDatabase(); // Concrete dependency

  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    const order = await this.database.save(orderData);
    await this.emailService.sendConfirmation(order.customerEmail);
    return order;
  }
}

// ✅ Following DIP
interface NotificationService {
  sendConfirmation(email: string): Promise<void>;
}

interface OrderRepository {
  save(orderData: CreateOrderDTO): Promise<Order>;
}

class OrderService {
  constructor(
    private notificationService: NotificationService, // Abstraction
    private orderRepository: OrderRepository, // Abstraction
  ) {}

  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    const order = await this.orderRepository.save(orderData);
    await this.notificationService.sendConfirmation(order.customerEmail);
    return order;
  }
}
```

## Event Architecture

### Domain Events

```typescript
// Base Domain Event
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = crypto.randomUUID();
  }

  abstract getEventName(): string;
  abstract getEventData(): any;
}

// Specific Events
export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
  ) {
    super();
  }

  getEventName(): string {
    return "user.registered";
  }

  getEventData(): any {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
    };
  }
}

export class OrderCreatedEvent extends DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly amount: number,
  ) {
    super();
  }

  getEventName(): string {
    return "order.created";
  }

  getEventData(): any {
    return {
      orderId: this.orderId,
      customerId: this.customerId,
      amount: this.amount,
    };
  }
}
```

### Event Handlers

```typescript
// Event Handler Interface
export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

// Specific Handlers
export class SendWelcomeEmailHandler
  implements EventHandler<UserRegisteredEvent>
{
  constructor(private emailService: EmailService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail(event.email, event.name);
  }
}

export class CreateUserProfileHandler
  implements EventHandler<UserRegisteredEvent>
{
  constructor(private profileService: ProfileService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    await this.profileService.createDefaultProfile(event.userId);
  }
}

export class SendOrderConfirmationHandler
  implements EventHandler<OrderCreatedEvent>
{
  constructor(
    private emailService: EmailService,
    private userRepository: UserRepository,
  ) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    const user = await this.userRepository.findById(event.customerId);
    if (user) {
      await this.emailService.sendOrderConfirmation(
        user.email,
        event.orderId,
        event.amount,
      );
    }
  }
}
```

## Architectural Error Handling

### Error Hierarchy

```typescript
// Base Error
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  abstract readonly isOperational: boolean;

  constructor(
    message: string,
    public readonly context?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Domain Errors
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
  readonly isOperational = true;

  constructor(resource: string, identifier?: string) {
    super(`${resource}${identifier ? ` with id ${identifier}` : ""} not found`);
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";
  readonly isOperational = true;

  constructor(message: string = "Unauthorized access") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";
  readonly isOperational = true;

  constructor(message: string = "Access forbidden") {
    super(message);
  }
}

// Infrastructure Errors
export class DatabaseError extends AppError {
  readonly statusCode = 500;
  readonly code = "DATABASE_ERROR";
  readonly isOperational = true;

  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
  }
}

export class ExternalServiceError extends AppError {
  readonly statusCode = 502;
  readonly code = "EXTERNAL_SERVICE_ERROR";
  readonly isOperational = true;

  constructor(service: string, message?: string) {
    super(`External service ${service} error: ${message || "Unknown error"}`);
  }
}
```

### Error Handler Middleware

```typescript
export class ErrorHandler {
  constructor(private logger: Logger) {}

  handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    if (error instanceof AppError) {
      this.handleAppError(error, req, res);
    } else {
      this.handleUnknownError(error, req, res);
    }
  }

  private handleAppError(error: AppError, req: Request, res: Response): void {
    this.logger.error("Application error", {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      context: error.context,
      stack: error.stack,
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      },
    });

    res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    });
  }

  private handleUnknownError(error: Error, req: Request, res: Response): void {
    this.logger.error("Unknown error", {
      error: error.message,
      stack: error.stack,
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
      },
    });

    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
    });
  }
}
```

## Architectural Best Practices

### 1. Separation of Concerns

- Each layer has a specific responsibility
- Dependencies flow inward
- Implementation details are isolated

### 2. Testability

- Use interfaces for all dependencies
- Implement dependency injection
- Create mocks and stubs easily

### 3. Maintainability

- Self-documenting code
- SOLID principles
- Consistent design patterns

### 4. Scalability

- Modular architecture
- Decoupled events
- Independent services

### 5. Performance

- Lazy loading
- Caching strategies
- Connection pooling
- Async/await patterns

### 6. Security

- Multi-layer validation
- Principle of least privilege
- Data sanitization
- Security logging

## Conclusion

This architecture provides:

- **Flexibility**: Easy to modify and extend
- **Testability**: Isolated and mockable components
- **Maintainability**: Clean and well-organized code
- **Scalability**: Ready to grow
- **Robustness**: Consistent error handling
- **Performance**: Optimized for production

Following these patterns and principles ensures high-quality code that is easy to maintain and scale.
