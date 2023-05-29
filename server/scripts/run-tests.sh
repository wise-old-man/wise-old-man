#!/usr/bin/env bash

ARGS="--verbose --runInBand";
BASE="__tests__/suites";
I="integration";
S=".test.ts";
U="unit";

fail() {
    echo "Error: $1";
    exit 1;
}

setup() {
    # Reset the test database
    export CORE_DATABASE=wise-old-man-test;
    export NODE_ENV=test TZ=UTC;
    prisma migrate reset --force;
}

execute() {
    # Setup docker dependencies (Postgres, PGAdmin and Redis)
    docker-compose up --build -d;
    setup;
    jest $1 $ARGS;
}

execute_lite() {
    jest $1 $ARGS;
    exit $?;
}

if [ $1 = "ci" ]; then
    # Skip docker setup for CI runs
    setup;
    execute_lite $BASE;
fi

if [ $2 ]; then
    case $2 in
        U|-U|u|-u|unit) TARGET="$BASE/$U/$1$S";;
        I|-I|i|-i|integration) TARGET="$BASE/$I/$1$S";;
        *) fail "'$2' is not a valid test suite. Use 'i' for integration or 'u' for unit.";;
    esac

    if ! [ -f $TARGET ]; then
        # The requested test is not valid
        fail "'$1' is not a valid test name.";
    fi

    if [ "$TARGET" = "$BASE/$U/$1$S" ]; then
        # We are only running unit tests - skip db and docker setup
        execute_lite $TARGET;
    fi

    # Run only the single requested test
    execute $TARGET;
elif [ $1 ]; then
    TARGET="$BASE/*/$1$S";
    TARGET_U="$BASE/$U/$1$S";
    TARGET_I="$BASE/$I/$1$S";

    if ! [ -f $TARGET_U ] && ! [ -f $TARGET_I ]; then
        # The requested test is not valid.
        fail "'$1' is not a valid test name.";
    fi

    if [ -f $TARGET_U ] && ! [ -f $TARGET_I ]; then
        # There is a unit test but no integration test - skip db and docker setup
        execute_lite $TARGET_U;
    fi

    # Execute both unit and integration tests with the given name
    execute $TARGET;
else
    # Execute all unit and integration tests
    execute $BASE;
fi
