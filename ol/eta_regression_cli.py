#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""CLI wrapper for eta_regression_core.run_pipeline.

Usage:
  python eta_regression_cli.py --input encrypted.xlsx --output encrypted_with_pred.xlsx --test-year 2025 --no-retrain-all

"""

import argparse

from eta_regression_core import run_pipeline


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True, help='Input Excel file (.xlsx)')
    ap.add_argument('--output', required=True, help='Output Excel file (.xlsx) with added predictions')
    ap.add_argument('--test-year', type=int, default=2025, help='Holdout year for evaluation (default: 2025)')
    ap.add_argument(
        '--no-retrain-all',
        action='store_true',
        help='If set, the models used for output are NOT retrained on all data (they stay trained without test-year).',
    )
    args = ap.parse_args()

    run_pipeline(
        input_path=args.input,
        output_path=args.output,
        test_year=args.test_year,
        no_retrain_all=args.no_retrain_all,
        logger=print,
    )


if __name__ == '__main__':
    main()
