using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRMAgent.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddManagerApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EscalationNote",
                table: "EmailDrafts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EscalationStatus",
                table: "EmailDrafts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "ManagerFeedback",
                table: "EmailDrafts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EscalationNote",
                table: "EmailDrafts");

            migrationBuilder.DropColumn(
                name: "EscalationStatus",
                table: "EmailDrafts");

            migrationBuilder.DropColumn(
                name: "ManagerFeedback",
                table: "EmailDrafts");
        }
    }
}
