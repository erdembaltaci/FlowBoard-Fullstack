using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JiraProject.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class newdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "issueCompletedDateTime",
                table: "Issues",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "issueCompletedDateTime",
                table: "Issues");
        }
    }
}
