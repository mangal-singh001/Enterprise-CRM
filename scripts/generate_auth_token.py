#!/usr/bin/env python3
"""
Helper script to generate a signed IdP SSO Authentication URL for local testing.
Usage:
    python scripts/generate_auth_token.py --user ops.lead@company.com --name "Ops Lead" --products edupulse,cloudmetric --role ADMIN
"""

import sys
import os
import argparse

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

try:
    from app.core.security import create_signed_idp_token
except ImportError as e:
    print(f"Error importing security module: {e}")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Generate signed IdP authentication URL for local enterprise CRM testing.")
    parser.add_argument("--user", type=str, default="jane.doe@company.com", help="Employee Email Address")
    parser.add_argument("--name", type=str, default="Jane Doe", help="Employee Full Name")
    parser.add_argument("--products", type=str, default="edupulse,cloudmetric", help="Comma-separated allowed product list")
    parser.add_argument("--role", type=str, default="ADMIN", choices=["ADMIN", "OPERATOR", "VIEWER"], help="User Role")
    parser.add_argument("--base-url", type=str, default="http://localhost:3000", help="CRM Frontend Base URL")
    
    args = parser.parse_args()
    
    products_list = [p.strip().lower() for p in args.products.split(",") if p.strip()]
    
    token = create_signed_idp_token(
        user_id=f"emp_{hash(args.user) % 100000}",
        email=args.user,
        name=args.name,
        allowed_products=products_list,
        role=args.role
    )
    
    sso_url = f"{args.base_url}/?token={token}"
    
    print("\n" + "="*80)
    print("  ENTERPRISE CRM - IDENTITY PROVIDER (IdP) TEST SSO URL GENERATOR")
    print("="*80)
    print(f" User Identity   : {args.name} ({args.user})")
    print(f" User Role       : {args.role}")
    print(f" Authorized Scopes: {', '.join(products_list)}")
    print("-" * 80)
    print(" Copy and paste the following URL into your browser to log in:\n")
    print(f" {sso_url}\n")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
