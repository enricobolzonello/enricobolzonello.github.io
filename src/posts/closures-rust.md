---
title: 'Deep Rust #1: Closures'
date: 2026-03-02
draft: false
tags:
    - "rust" 
author: Enrico Bolzonello
---

Rust has unique characteristics that are easy to overlook when you come from other languages. To bridge this gap I started doing [one quiz a day](https://dtolnay.github.io/rust-quiz/), using each one as an excuse to dig deeper into the features I tend to avoid.

The past two days I tackled quiz 36 and quiz 26, both involving closures. Quiz 36 in particular bugged me. Consider the following code:
```rust
fn call(mut f: impl FnMut() + Copy) {
    f();
}

fn g(mut f: impl FnMut() + Copy) {
    f();
    call(f);
    f();
    call(f);
}

fn main() {
    let mut i = 0i32;
    g(move || {
        i += 1;
        print!("{}", i);
    });
}
```
To understand this I needed some context on closures. What does `move` do? What is the `FnMut` trait?

## What is a closure?

> **Closures** are anonymous functions that can be saved in a variable or passed as arguments to other functions

Unlike normal functions, closures can capture values from the scope they are defined in and there is no need for type annotation, since in most cases types are infered at compile-time. 

The real deal about closures is that they can capture values from the environment, and it can do so in three ways depending on what the body does:
- borrow immutable
- borrow mutable
- taking ownership with the `move`

So we have the first piece of the puzzle: the closure takes ownership of `i`. But ownership alone doesn't tell the full story, what the closure *does* with that value inside its body matters too.

## The Fn traits

The way a closure captures and handles values from the environment affects which traits the closure implements. These are the traits that can be implemented:
- `FnOnce`, applies to closures that can be called once
- `FnMut`, applies to closures that don't move captured values out of their body but might mutate the captured values. It can be called more than once
- `Fn`, applies to closures that don't move captured values out of their body and don't mutate captured values, as well as closures that capture nothing from the environment. It can be called more than once without mutating the environment.

| Trait    | Body does                         | Can be called            |
| -------- | --------------------------------- | ------------------------ |
| `FnOnce` | Moves captured values out         | Only once                |
| `FnMut`  | Mutates but doesn't move out      | Multiple times (mutably) |
| `Fn`     | Neither mutates nor moves out     | Multiple times           |

## Back to the quiz

Now we can apply this back to the quiz. The closure body does `i += 1`: it mutates `i` but never moves `i` out of the body. That rules out `FnOnce` and lands us on `FnMut`. And since `i` is `i32` (which is `Copy`) and the closure captured it by `move`, the closure itself is `Copy`.

This is the key: when `g` passes `f` to `call(f)`, `f` is **copied**, not moved. Each copy of the closure has its own independent `i`.

Tracing through the execution:
- `f()` runs the closure and its captured `i` becomes 1.
- `call(f)` copies `f` and executes the copy — the copy's `i` becomes 2, but the original `f` still holds `i = 1`.
- `f()` runs the original closure again and its `i` becomes 2.
- `call(f)` copies `f` a second time and executes the copy — its `i` becomes 3.


An important remark is that `move` and `Fn`/`FnMut`/`FnOnce` closures are almost orthogonal:
- `move` vs non-`move` is about whether the **fields** of the compiled struct have the same type as the original vs are references
- `Fn`/`FnMut`/`FnOnce` is about whether the **call method** of the compiled struct has a receiver which is `&self` vs `&mut self` vs `self`
