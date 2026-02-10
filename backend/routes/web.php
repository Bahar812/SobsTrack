<?php

use Illuminate\Support\Facades\Route;

$frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

Route::get('/', function () use ($frontendUrl) {
    if (app()->environment('local')) {
        return redirect()->away($frontendUrl);
    }

    return view('welcome');
});

Route::get('/{any}', function () use ($frontendUrl) {
    if (app()->environment('local')) {
        return redirect()->away($frontendUrl);
    }

    return view('welcome');
})->where('any', '.*');
