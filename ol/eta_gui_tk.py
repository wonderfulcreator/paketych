#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tkinter GUI for ETA regression pipeline.

Features
- Choose or drag & drop an .xlsx file
- Set output path (default: <input>_with_pred.xlsx)
- Set holdout test year (default: 2025)
- Optionally disable retrain on all data ("честный" backtest)
- Run pipeline and see logs

Build to EXE (Windows) via PyInstaller:
  pyinstaller --noconsole --onefile --name ETA_Predictor \
    --collect-all sklearn --collect-all openpyxl --collect-all pandas --collect-all numpy \
    eta_gui_tk.py

If you want drag&drop, install: tkinterdnd2
"""

from __future__ import annotations

import os
import sys
import threading
import traceback
from datetime import datetime

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

from eta_regression_core import run_pipeline

# Optional drag&drop support
_HAS_DND = False
try:
    # tkinterdnd2 supports drag&drop on Windows/Mac/Linux
    from tkinterdnd2 import DND_FILES, TkinterDnD  # type: ignore

    _HAS_DND = True
except Exception:
    _HAS_DND = False


def _default_output_path(input_path: str) -> str:
    base, ext = os.path.splitext(input_path)
    if not ext:
        ext = ".xlsx"
    return base + "_with_pred" + ext


class App:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("ETA Predictor")
        self.root.geometry("900x560")
        try:
            self.root.iconbitmap(default=self._resource_path("app.ico"))
        except Exception:
            pass

        self.input_var = tk.StringVar()
        self.output_var = tk.StringVar()
        self.test_year_var = tk.StringVar(value="2025")
        self.no_retrain_var = tk.BooleanVar(value=True)

        self._build_ui()

    def _resource_path(self, relative_path: str) -> str:
        # PyInstaller compatibility
        base_path = getattr(sys, "_MEIPASS", os.path.abspath("."))
        return os.path.join(base_path, relative_path)

    def _build_ui(self):
        pad = 10
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(1, weight=1)

        header = ttk.Frame(self.root)
        header.grid(row=0, column=0, sticky="ew", padx=pad, pady=(pad, 0))
        header.columnconfigure(0, weight=1)

        title = ttk.Label(header, text="Прогноз ETA (регрессионная модель)", font=("Segoe UI", 14, "bold"))
        title.grid(row=0, column=0, sticky="w")

        sub = ttk.Label(
            header,
            text="Загрузите Excel (.xlsx) → нажмите «Запустить». Результат сохранится как новый файл.",
        )
        sub.grid(row=1, column=0, sticky="w", pady=(2, 0))

        main = ttk.Frame(self.root)
        main.grid(row=1, column=0, sticky="nsew", padx=pad, pady=pad)
        main.columnconfigure(0, weight=1)
        main.rowconfigure(3, weight=1)

        # Input
        in_frame = ttk.LabelFrame(main, text="Входной файл")
        in_frame.grid(row=0, column=0, sticky="ew")
        in_frame.columnconfigure(0, weight=1)

        in_entry = ttk.Entry(in_frame, textvariable=self.input_var)
        in_entry.grid(row=0, column=0, sticky="ew", padx=pad, pady=pad)

        in_btn = ttk.Button(in_frame, text="Выбрать…", command=self.pick_input)
        in_btn.grid(row=0, column=1, padx=(0, pad), pady=pad)

        # Drag&drop area
        dnd_text = "Перетащите файл сюда" if _HAS_DND else "Drag&Drop недоступен (установите tkinterdnd2)"
        self.drop = ttk.Label(in_frame, text=dnd_text, anchor="center")
        self.drop.grid(row=1, column=0, columnspan=2, sticky="ew", padx=pad, pady=(0, pad))
        self.drop.configure(padding=8)

        if _HAS_DND:
            # register as drop target
            try:
                self.drop.drop_target_register(DND_FILES)  # type: ignore
                self.drop.dnd_bind("<<Drop>>", self.on_drop)  # type: ignore
            except Exception:
                # If something goes wrong, just keep pick button
                pass

        # Output
        out_frame = ttk.LabelFrame(main, text="Выходной файл")
        out_frame.grid(row=1, column=0, sticky="ew", pady=(pad, 0))
        out_frame.columnconfigure(0, weight=1)

        out_entry = ttk.Entry(out_frame, textvariable=self.output_var)
        out_entry.grid(row=0, column=0, sticky="ew", padx=pad, pady=pad)

        out_btn = ttk.Button(out_frame, text="Куда сохранить…", command=self.pick_output)
        out_btn.grid(row=0, column=1, padx=(0, pad), pady=pad)

        # Options
        opt = ttk.LabelFrame(main, text="Параметры")
        opt.grid(row=2, column=0, sticky="ew", pady=(pad, 0))

        ttk.Label(opt, text="Тестовый год (holdout):").grid(row=0, column=0, padx=pad, pady=pad, sticky="w")
        year_entry = ttk.Entry(opt, width=10, textvariable=self.test_year_var)
        year_entry.grid(row=0, column=1, padx=(0, pad), pady=pad, sticky="w")

        cb = ttk.Checkbutton(
            opt,
            text="Не переобучать на всех данных после теста (честный backtest)",
            variable=self.no_retrain_var,
        )
        cb.grid(row=0, column=2, padx=(0, pad), pady=pad, sticky="w")

        # Run row
        run_row = ttk.Frame(main)
        run_row.grid(row=3, column=0, sticky="nsew", pady=(pad, 0))
        run_row.columnconfigure(0, weight=1)
        run_row.rowconfigure(1, weight=1)

        btn_row = ttk.Frame(run_row)
        btn_row.grid(row=0, column=0, sticky="ew")
        btn_row.columnconfigure(1, weight=1)

        self.run_btn = ttk.Button(btn_row, text="Запустить", command=self.run)
        self.run_btn.grid(row=0, column=0, padx=(0, pad), pady=(0, pad), sticky="w")

        self.progress = ttk.Progressbar(btn_row, mode="indeterminate")
        self.progress.grid(row=0, column=1, sticky="ew", pady=(0, pad))

        clear_btn = ttk.Button(btn_row, text="Очистить лог", command=self.clear_log)
        clear_btn.grid(row=0, column=2, padx=(pad, 0), pady=(0, pad))

        # Log
        self.log = tk.Text(run_row, height=12, wrap="word")
        self.log.grid(row=1, column=0, sticky="nsew")
        self.log.configure(state="disabled")

        # Footer
        footer = ttk.Frame(self.root)
        footer.grid(row=2, column=0, sticky="ew", padx=pad, pady=(0, pad))
        footer.columnconfigure(0, weight=1)

        tip = (
            "Подсказка: можно вести один рабочий файл, добавлять новые строки и факты по мере движения. "
            "Скрипт заполнит прогнозы только там, где нет факта прибытия в конечный порт."
        )
        ttk.Label(footer, text=tip).grid(row=0, column=0, sticky="w")

    def append_log(self, msg: str):
        ts = datetime.now().strftime("%H:%M:%S")
        line = f"[{ts}] {msg}\n"
        self.log.configure(state="normal")
        self.log.insert("end", line)
        self.log.see("end")
        self.log.configure(state="disabled")

    def clear_log(self):
        self.log.configure(state="normal")
        self.log.delete("1.0", "end")
        self.log.configure(state="disabled")

    def pick_input(self):
        path = filedialog.askopenfilename(
            title="Выберите Excel файл",
            filetypes=[("Excel", "*.xlsx"), ("All files", "*.*")],
        )
        if not path:
            return
        self.input_var.set(path)
        if not self.output_var.get():
            self.output_var.set(_default_output_path(path))

    def pick_output(self):
        suggested = self.output_var.get() or (self.input_var.get() and _default_output_path(self.input_var.get()))
        path = filedialog.asksaveasfilename(
            title="Сохранить результат как",
            defaultextension=".xlsx",
            initialfile=os.path.basename(suggested) if suggested else "encrypted_with_pred.xlsx",
            filetypes=[("Excel", "*.xlsx")],
        )
        if not path:
            return
        self.output_var.set(path)

    def on_drop(self, event):
        # event.data may contain a list like '{C:\path\file.xlsx}'
        data = getattr(event, "data", "")
        if not data:
            return
        # Cleanup braces and potential multiple files
        data = data.strip()
        if data.startswith("{") and data.endswith("}"):
            data = data[1:-1]
        first = data.split()[0]
        if first.lower().endswith(".xlsx"):
            self.input_var.set(first)
            if not self.output_var.get():
                self.output_var.set(_default_output_path(first))

    def _validate(self) -> tuple[str, str, int, bool]:
        inp = self.input_var.get().strip()
        out = self.output_var.get().strip()
        if not inp:
            raise ValueError("Выберите входной файл .xlsx")
        if not os.path.exists(inp):
            raise ValueError("Входной файл не найден")
        if not inp.lower().endswith(".xlsx"):
            raise ValueError("Входной файл должен быть .xlsx")
        if not out:
            out = _default_output_path(inp)
            self.output_var.set(out)
        try:
            year = int(self.test_year_var.get().strip())
        except Exception:
            raise ValueError("Тестовый год должен быть числом (например, 2025)")
        no_retrain_all = bool(self.no_retrain_var.get())
        return inp, out, year, no_retrain_all

    def run(self):
        try:
            inp, out, year, no_retrain_all = self._validate()
        except Exception as e:
            messagebox.showerror("Ошибка", str(e))
            return

        self.run_btn.configure(state="disabled")
        self.progress.start(10)
        self.append_log(f"Старт: {os.path.basename(inp)}")

        def worker():
            try:
                metrics = run_pipeline(
                    input_path=inp,
                    output_path=out,
                    test_year=year,
                    no_retrain_all=no_retrain_all,
                    logger=self.append_log,
                )
                self.append_log("\nМетрики (holdout):")
                for stage, m in metrics.items():
                    if not m:
                        self.append_log(f"  {stage}: нет данных")
                        continue
                    if "baseline_mae" in m:
                        self.append_log(
                            f"  {stage}: baseline MAE={m['baseline_mae']:.2f}д, model MAE={m.get('model_mae', float('nan')):.2f}д, n={m.get('n', 0)}"
                        )
                    else:
                        self.append_log(f"  {stage}: model MAE={m.get('model_mae', float('nan')):.2f}д, n={m.get('n', 0)}")
                self.append_log(f"\nФайл сохранён: {out}")

                def done_ok():
                    self.progress.stop()
                    self.run_btn.configure(state="normal")
                    messagebox.showinfo("Готово", f"Готово!\n\nРезультат: {out}")

                self.root.after(0, done_ok)
            except Exception:
                err = traceback.format_exc()
                self.append_log("\nОШИБКА:\n" + err)

                def done_fail():
                    self.progress.stop()
                    self.run_btn.configure(state="normal")
                    messagebox.showerror("Ошибка", "Во время обработки произошла ошибка.\nСмотрите лог внизу окна.")

                self.root.after(0, done_fail)

        threading.Thread(target=worker, daemon=True).start()


def main():
    if _HAS_DND:
        root = TkinterDnD.Tk()  # type: ignore
    else:
        root = tk.Tk()

    # Use native theme where possible
    try:
        style = ttk.Style(root)
        if "vista" in style.theme_names():
            style.theme_use("vista")
    except Exception:
        pass

    app = App(root)
    root.mainloop()


if __name__ == "__main__":
    main()
