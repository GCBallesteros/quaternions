# Development Conventions

## Overview

A 3D visualization tool for satellite positioning and orientation, featuring:
- Interactive Earth and satellite visualization
- Domain Specific Language (DSL) for position/attitude control
- Real-time satellite tracking via TLE data
- Command-line interface with 3D viewport

## Core Architecture

### Code Organization

1. **Core Implementation (`core.ts`)**
   - Contains pure function implementations of all DSL features
   - Functions prefixed with underscore (e.g., `_mov`, `_rot`)
   - No reliance on global state - all dependencies passed as parameters
   - Handles core computation and transformations
   - Example: `_mov()` implements position changes, `_rot()` handles rotations

2. **User API (`commands.ts`)**
   - Creates closures over application state
   - Wraps core functions to provide simpler interface
   - Manages state and scene interactions
   - Example: `mov()` wraps `_mov()` with state handling

3. **State Management**
   - Centralized in `State` interface
   - Contains all mutable application state:
     - Points and oriented points
     - Lines and geometries
     - Lights and cameras
     - Current time
     - TLE data cache

### Development Guidelines

1. **Documentation**
   - Maintain docs in `docs/` using VitePress
   - Keep documentation in sync with code changes
   - Cover:
     - DSL command reference
     - Common workflows
     - Architecture overview
     - Development guidelines

2. **Code Style**
   - Use TypeScript with strict type checking
   - Prefix internal functions with underscore
   - Use consistent Vector3 type for 3D coordinates
   - Provide clear error messages to users
   - Follow existing naming conventions

3. **Dependencies**
   - Minimize external dependencies
   - Prefer native browser/Node.js APIs when possible
   - Core dependencies limited to:
     - Three.js: 3D visualization
     - Satellite.js: Orbital calculations
   - Evaluate trade-offs for new dependencies:
     - Bundle size impact
     - Security implications
     - Maintenance overhead

4. **Error Handling**
   - Validate all inputs thoroughly
   - Provide clear error messages
   - Handle errors gracefully
   - Log useful feedback to users
