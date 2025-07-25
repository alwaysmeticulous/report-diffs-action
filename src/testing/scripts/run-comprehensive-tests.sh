#!/bin/bash

# Comprehensive test runner script
# Supports running tests against mock services or real Meticulous APIs

set -e

# Default values
TEST_MODE="mock"
ENVIRONMENT="development"
PARALLEL=false
PERFORMANCE=false
REAL_API=false
VERBOSE=false
COVERAGE=false

# Help function
show_help() {
cat << EOF
Comprehensive Test Runner for Meticulous Report Diffs Action

Usage: $0 [OPTIONS]

OPTIONS:
    -m, --mode MODE         Test mode: mock, sandbox, staging, production (default: mock)
    -e, --env ENV          Environment: development, ci, stress (default: development)
    -p, --parallel         Run tests in parallel
    -P, --performance      Enable performance testing
    -r, --real-api         Use real Meticulous APIs (requires tokens)
    -v, --verbose          Verbose output
    -c, --coverage         Generate test coverage report
    -h, --help             Show this help message

ENVIRONMENT VARIABLES:
    METICULOUS_SANDBOX_API_TOKEN    Required for sandbox/staging/production modes
    GITHUB_TEST_TOKEN               Required for real GitHub API calls
    TEST_ENVIRONMENT_MODE           Override test mode
    USE_REAL_APIS                   Set to 'true' to force real API usage
    ALLOW_REAL_APIS_IN_CI          Set to 'true' to allow real APIs in CI

EXAMPLES:
    # Run basic mock tests
    $0

    # Run against Meticulous sandbox with performance testing
    $0 --mode sandbox --real-api --performance

    # Run comprehensive stress tests
    $0 --env stress --parallel --coverage

    # Run in CI with real APIs (if tokens are available)
    ALLOW_REAL_APIS_IN_CI=true $0 --mode sandbox --real-api

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            TEST_MODE="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -p|--parallel)
            PARALLEL=true
            shift
            ;;
        -P|--performance)
            PERFORMANCE=true
            shift
            ;;
        -r|--real-api)
            REAL_API=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--coverage)
            COVERAGE=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate test mode
case $TEST_MODE in
    mock|sandbox|staging|production)
        ;;
    *)
        echo "Error: Invalid test mode '$TEST_MODE'"
        echo "Valid modes: mock, sandbox, staging, production"
        exit 1
        ;;
esac

# Validate environment
case $ENVIRONMENT in
    development|ci|stress)
        ;;
    *)
        echo "Error: Invalid environment '$ENVIRONMENT'"
        echo "Valid environments: development, ci, stress"
        exit 1
        ;;
esac

# Set environment variables
export TEST_ENVIRONMENT_MODE="$TEST_MODE"
export PERFORMANCE_ENVIRONMENT="$ENVIRONMENT"

if [ "$REAL_API" = true ]; then
    export USE_REAL_APIS="true"
fi

if [ "$VERBOSE" = true ]; then
    export VERBOSE="true"
fi

# Color output functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js and Yarn
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v yarn &> /dev/null; then
        log_error "Yarn is required but not installed"
        exit 1
    fi
    
    # Check for required tokens when using real APIs
    if [ "$REAL_API" = true ] && [ "$TEST_MODE" != "mock" ]; then
        if [ -z "$METICULOUS_SANDBOX_API_TOKEN" ] && [ "$TEST_MODE" != "mock" ]; then
            log_error "METICULOUS_SANDBOX_API_TOKEN is required for real API testing"
            log_info "Set the environment variable or use --mode mock"
            exit 1
        fi
        
        if [ -z "$GITHUB_TEST_TOKEN" ]; then
            log_warning "GITHUB_TEST_TOKEN not set - some GitHub API tests may fail"
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    yarn install --frozen-lockfile --silent
    log_success "Dependencies installed"
}

# Build the project
build_project() {
    log_info "Building project..."
    yarn build
    log_success "Project built successfully"
}

# Run linting
run_linting() {
    log_info "Running linting..."
    yarn lint
    log_success "Linting passed"
}

# Run type checking
run_type_checking() {
    log_info "Running type checking..."
    yarn build  # TypeScript compilation serves as type checking
    log_success "Type checking passed"
}

# Run unit tests
run_unit_tests() {
    log_info "Running unit tests..."
    
    local test_cmd="yarn test"
    
    if [ "$COVERAGE" = true ]; then
        test_cmd="$test_cmd --coverage"
    fi
    
    if [ "$PARALLEL" = true ]; then
        test_cmd="$test_cmd --maxWorkers=4"
    else
        test_cmd="$test_cmd --maxWorkers=1"
    fi
    
    $test_cmd
    log_success "Unit tests passed"
}

# Run integration tests
run_integration_tests() {
    log_info "Running integration tests..."
    log_info "Mode: $TEST_MODE, Environment: $ENVIRONMENT, Real APIs: $REAL_API"
    
    local test_cmd="yarn test:integration"
    local timeout=300000  # 5 minutes default
    
    # Adjust timeout based on environment and API mode
    case $ENVIRONMENT in
        stress)
            timeout=1800000  # 30 minutes
            ;;
        ci)
            timeout=900000   # 15 minutes
            ;;
    esac
    
    if [ "$REAL_API" = true ]; then
        timeout=$((timeout * 2))  # Double timeout for real APIs
    fi
    
    # Configure Jest for integration tests
    export JEST_TIMEOUT=$timeout
    
    if [ "$PARALLEL" = true ] && [ "$REAL_API" = false ]; then
        test_cmd="$test_cmd --maxWorkers=2"
    else
        test_cmd="$test_cmd --maxWorkers=1"  # Sequential for real APIs
    fi
    
    if [ "$COVERAGE" = true ]; then
        test_cmd="$test_cmd --coverage"
    fi
    
    # Run different test suites based on configuration
    if [ "$PERFORMANCE" = true ]; then
        log_info "Running performance tests..."
        yarn test:integration:performance
    fi
    
    # Run comprehensive real API tests if configured
    if [ "$REAL_API" = true ]; then
        log_info "Running real API integration tests..."
        yarn test:integration:real-api
    fi
    
    # Run standard integration tests
    $test_cmd
    
    log_success "Integration tests passed"
}

# Run performance benchmarks
run_performance_tests() {
    if [ "$PERFORMANCE" = false ]; then
        return
    fi
    
    log_info "Running performance benchmarks..."
    
    # Set performance environment
    export PERFORMANCE_MODE="true"
    export PERFORMANCE_CONFIG="$ENVIRONMENT"
    
    yarn test:performance
    
    log_success "Performance tests completed"
}

# Generate reports
generate_reports() {
    log_info "Generating test reports..."
    
    # Generate coverage report if enabled
    if [ "$COVERAGE" = true ]; then
        log_info "Generating coverage report..."
        if [ -d "coverage" ]; then
            log_info "Coverage report available at: coverage/lcov-report/index.html"
        fi
    fi
    
    # Generate performance report if enabled
    if [ "$PERFORMANCE" = true ]; then
        log_info "Generating performance report..."
        # Performance reports would be generated by the performance harness
    fi
    
    log_success "Reports generated"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
    
    # Clean temporary files
    rm -rf /tmp/meticulous-test-* 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Set up trap for cleanup
trap cleanup EXIT

# Main execution
main() {
    log_info "Starting comprehensive test suite..."
    log_info "Configuration:"
    log_info "  Test Mode: $TEST_MODE"
    log_info "  Environment: $ENVIRONMENT"
    log_info "  Parallel: $PARALLEL"
    log_info "  Performance: $PERFORMANCE"
    log_info "  Real APIs: $REAL_API"
    log_info "  Coverage: $COVERAGE"
    
    # Run test phases
    check_prerequisites
    install_dependencies
    build_project
    run_linting
    run_type_checking
    run_unit_tests
    run_integration_tests
    run_performance_tests
    generate_reports
    
    log_success "All tests completed successfully!"
    
    # Print summary
    echo ""
    log_info "=== Test Summary ==="
    log_success "✓ Prerequisites check"
    log_success "✓ Build and linting"
    log_success "✓ Type checking"
    log_success "✓ Unit tests"
    log_success "✓ Integration tests"
    
    if [ "$PERFORMANCE" = true ]; then
        log_success "✓ Performance tests"
    fi
    
    if [ "$COVERAGE" = true ]; then
        log_success "✓ Coverage report generated"
    fi
    
    echo ""
    log_info "Test mode: $TEST_MODE"
    
    if [ "$REAL_API" = true ]; then
        log_warning "Real API tests were executed - check for any test data in $TEST_MODE environment"
    fi
}

# Execute main function
main "$@"